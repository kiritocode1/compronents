/**
 * Retrieval facets. Every link gets per-link facets at resolve time from its
 * title/description/host (`deriveLinkFacets` in inspiration-meta.ts), plus
 * category defaults. Set these fields only to override the derived values.
 */
export type InspirationKind =
  | "library"
  | "essay"
  | "gallery"
  | "portfolio"
  | "tool"
  | "course"
  | "video"
  | "directory"
  | "demo"
  | "asset"
  | "skill";

/** Controlled vibe vocabulary for "like Linear / restrained motion" direction. */
export type StyleTag =
  | "product-dense"
  | "marketing-motion"
  | "editorial"
  | "brutalist"
  | "restrained-motion"
  | "liquid-glass"
  | "terminal"
  | "soft-ui"
  | "maximalist"
  | "minimal";

export interface InspirationLink {
  title: string;
  href: string;
  description?: string;
  /** ISO `YYYY-MM-DD` date this link entered the registry (from git history). */
  dateAdded: string;
  /** Optional kind override; otherwise derived from description + category. */
  kind?: InspirationKind | InspirationKind[];
  /** Optional stack tags; merged with derived + category defaults. */
  stack?: string[];
  /** Optional use-for phrases; merged ahead of derived title/host phrases. */
  useFor?: string[];
  /** Optional style tags; merged with derived + category defaults. */
  style?: StyleTag | StyleTag[];
}

export interface InspirationGroup {
  title: string;
  links: InspirationLink[];
}

/**
 * One-line "how to use this category" note per group, keyed by group title.
 * Surfaced in llms.txt so an agent reading the feed knows whether to install,
 * use, read, or just browse a given category before acting on it.
 */
const GROUP_USAGE: Record<string, string> = {
  React:
    "Mix of libraries and deep-dive articles: install the libraries, read the articles for patterns.",
  "React Native and mobile":
    "Libraries and tooling for React Native: install what your app needs.",
  "JavaScript and TypeScript":
    "Reference material and libraries: read for fundamentals, install the small libraries.",
  "Web platform, CSS and performance":
    "Guides on browser internals and performance: read before optimizing.",
  "Frontend architecture and patterns":
    "Architecture guides and tools: read for patterns, try the tools on real projects.",
  Icons: "Icon libraries: install the one that matches your icon style.",
  "Animated icon libraries":
    "Animated icon libraries: install for motion-ready icons out of the box.",
  "UI kit directories":
    "Directories of UI kits: browse, then install the kit that fits your stack.",
  "Component libraries and blocks":
    "Component libraries: install and copy the blocks you need.",
  "Component demos and micro-interactions":
    "Live demos and one-off interactions: study the source, adapt the technique.",
  "Interface design guidelines and craft":
    "Design guidelines and craft essays: read before shipping a UI.",
  "Design inspiration galleries":
    "Inspiration galleries: browse for visual reference, not code.",
  "Portfolios and studios":
    "Studio and portfolio sites: browse for craft and visual direction.",
  "Color, gradients and palettes":
    "Color and gradient tools: use them to generate palettes.",
  "CSS and shape generators":
    "CSS generators: use them to produce ready-to-paste styles.",
  "Illustration and visual assets":
    "Illustration assets: download and drop into a project.",
  "Typography tools": "Typography tools: use them to pair and tune type.",
  "Type foundries and directories":
    "Type foundries: browse and license the typefaces you like.",
  "Free typefaces": "Free typefaces: download and self-host.",
  "Branding and logo archives":
    "Logo and branding archives: browse for reference, not reuse.",
  "Design essays and culture":
    "Essays on design culture: read for perspective.",
  "Animation and motion":
    "Animation libraries and guides: install the libraries, read the guides for technique.",
  "WebGL, shaders and creative coding":
    "WebGL and shader tooling: install the libraries, read the write-ups for technique.",
  "Audio, video and media":
    "Audio and video libraries: install what your media pipeline needs.",
  "LLMs and AI engineering":
    "LLM engineering references: read before building with a model.",
  "Machine learning and deep learning":
    "ML and deep learning references: read for fundamentals.",
  "AI tools, agents and search":
    "AI tools and agents: use them directly in your workflow.",
  "AI agent platforms and infrastructure":
    "Agent platforms and infra: evaluate and use the ones that fit your stack.",
  "Backend engineering":
    "Backend engineering references: read before architecting a service.",
  "Databases and storage":
    "Databases and storage tools: use them directly, or read for tradeoffs.",
  "Infrastructure, observability and runtimes":
    "Infra and observability tools: use them to run and monitor services.",
  "Distributed systems and computer science":
    "Systems and CS references: read for fundamentals.",
  "Books and fundamentals": "Books: read them.",
  "Courses and learning paths": "Courses: work through them.",
  "Coding challenges and practice": "Practice problems: work through them.",
  "Developer tools and utilities":
    "Developer tools: install and use them directly.",
  "Productivity and business tools": "Productivity tools: use them directly.",
  "File sharing and conversion tools": "File tools: use them directly.",
  "ASCII art and diagram tools":
    "Diagram tools: use them to generate diagrams.",
  "Marketing and growth tools": "Marketing tools: use them directly.",
  "Effect ecosystem":
    "Effect libraries: install and use in place of hand-rolled abstractions.",
  "Docs, slides and content tools": "Content tools: use them directly.",
  "Personal blogs and sites": "Personal blogs: read for perspective.",
  "Developer profiles and socials": "Developer profiles: follow for updates.",
  "Engineering essays and culture":
    "Essays on engineering culture: read for perspective.",
  "YouTube channels": "YouTube channels: subscribe and watch.",
  "Talks and individual videos": "Talks: watch them.",
  "Self-hosted software": "Self-hosted software: deploy your own instance.",
  "Mockups, textures and patterns":
    "Mockups and textures: download and drop into a design file.",
  "Agent skills directories":
    "Agent skills: install them directly into your coding agent.",
  "VPS and hosting videos":
    "Hosting comparison videos: watch before picking a provider.",
};

export const inspirationGroups: InspirationGroup[] = [
  {
    title: "React",
    links: [
      {
        title: "TanStack",
        href: "https://tanstack.com/",
        dateAdded: "2026-07-22",
        description:
          "Home for the headless, type-safe TanStack libraries: Query, Router, Table, Form, Virtual and the Start full-stack framework, plus newer betas and alphas (DB, Store, AI, Pacer, Hotkeys, CLI, Intent). Every library ships a framework-agnostic core with adapters for React, Vue, Solid, Angular and vanilla JS, so the same mental model carries across stacks. Led by Tanner Linsley with maintainers including Dominik Dorfmeister and Corbin Crutchley; all MIT licensed with no paid tier, and the site reports 13.5B total npm downloads and roughly 126k GitHub stars.",
      },
      {
        title: "React Flow",
        href: "https://reactflow.dev/",
        dateAdded: "2026-07-14",
        description:
          "Library for building node-based editors and interactive diagrams in React, drag-and-drop nodes, edges and custom node types, used for flow builders, pipelines and mind maps. Maintained by xyflow, a Berlin-based team; pulls 10M+ weekly npm installs and powers production diagrams at Stripe and Typeform.",
      },
      {
        title: "Made With React",
        href: "https://madewithreactjs.com/",
        dateAdded: "2026-07-14",
        description:
          "Curated showcase of projects and apps built with React, browsable by category: frameworks, UI components, boilerplates and full apps. Part of a sister-site network alongside Made With Vue.js, Laravel and Svelte showcases, with projects submitted directly by their creators.",
      },
      {
        title: "React Handbook",
        href: "https://devouringdetails.com/resources/react-handbook",
        dateAdded: "2026-07-13",
        description:
          "Guide to writing better React components through naming and architecture patterns: contextual props to cut redundancy, deriving booleans from existing props to prevent impossible states, and enum props for stronger typing and autocomplete. Excerpted from Devouring Details, a 23-chapter interactive book pairing each chapter with a downloadable React component to inspect.",
      },
      {
        title: "React Fiber, part 1",
        href: "https://kishore.app/blog/fiber-part-1?utm_source=x",
        dateAdded: "2026-07-13",
        description:
          "First part of a blog series digging into React Fiber, React's reconciliation engine, explaining how it schedules and interrupts rendering work. Covers the pre-Fiber stack reconciler React shipped before v16, then how the 2017 Fiber rewrite replaced it with an interruptible linked-list architecture.",
      },
      {
        title: "React Tricks",
        href: "https://molefrog.com/notes/react-tricks",
        dateAdded: "2026-07-13",
        description:
          "Performance and bundle-size techniques the author learned maintaining Wouter, a lightweight React router: composing with React.cloneElement, stable object references, initializing with useState, stable callbacks via useEvent, and subscribing to external state with useSyncExternalStore. Written by Alexey Taktarov, wouter's author, adapted from his November 2023 Copenhagen React Meetup talk; wouter itself ships at just 2.1KB.",
      },
      {
        title: "Web Workers with React",
        href: "https://www.rahuljuliato.com/posts/react-workers",
        dateAdded: "2026-07-13",
        description:
          "Post walking through offloading heavy computation from a React app's main thread into Web Workers, keeping the UI responsive during expensive work. Recommends Comlink for calling worker functions as if local, and covers Shared Workers' many-to-one port.postMessage alongside a task-queue pattern.",
      },
      {
        title: "Prod-ready React hooks",
        href: "https://4markdown.com/1-prod-ready-react-usefeature-and-usesimplefeature-hooks/",
        dateAdded: "2026-07-13",
        description:
          'Walks through two custom hooks for managing UI visibility state: useSimpleFeature for plain toggles and useFeature for toggles that carry associated data, using a discriminant property for type safety. By Adrian Połubiński: types state as a union like { is: "off" } | { is: "on"; data }, so data is only accessible when "on", no manual null checks.',
      },
      {
        title: "React TypeScript Cheatsheet",
        href: "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/",
        dateAdded: "2026-07-13",
        description:
          "Community-maintained cheatsheet for typing React with TypeScript: props, hooks, forms, events and common patterns, the go-to reference when you're not sure how to type something in React. Maintained by the typescript-cheatsheets GitHub org; this page flags that React 19.2 deprecates FormEvent/FormEventHandler in favor of SubmitEvent/SubmitEventHandler.",
      },
      {
        title: "TkDodo's blog",
        href: "https://tkdodo.eu/blog/all",
        dateAdded: "2026-07-14",
        description:
          'Blog by Dominik Dorfmeister, maintainer of TanStack Query, with deep, practical posts on React Query, testing, and React patterns that go well beyond the official docs. 95 posts spanning August 2020 to May 2026, including the deliberately contrarian "The Useless useCallback" from July 2025.',
      },
      {
        title: "React Grab",
        href: "https://react-grab.com/",
        dateAdded: "2026-07-14",
        description:
          "Browser tool for grabbing a UI element's React component context with a hover and keyboard shortcut, for handing precise context to a coding agent instead of describing it in prose. Triggered by hovering an element and pressing Cmd+C/Ctrl+C, it copies the file name, React component, and HTML source in one shortcut, no extra UI.",
      },
      {
        title: "React Quill",
        href: "https://zenoamaro.github.io/react-quill/",
        dateAdded: "2026-07-13",
        description:
          "React wrapper around the Quill rich text editor, for dropping a full WYSIWYG editor into a React app without wiring up Quill's imperative API by hand. Largely unmaintained since 2021; most active projects now install the community fork react-quill-new instead for React 18/19 and bug fixes.",
      },
      {
        title: "NextFaster",
        href: "https://github.com/ethanniser/NextFaster",
        dateAdded: "2026-07-15",
        description:
          "Performance-obsessed Next.js e-commerce template built to feel instant: aggressive prefetching, minimal client JS and careful data loading, with a live demo and full source to study. Built by Ethan Niser with Rhys Sullivan and Arman K.; the public demo logged 1M+ page views on ~$513 of hosting in three weeks.",
      },
    ],
  },
  {
    title: "React Native and mobile",
    links: [
      {
        title: "Laminar",
        href: "https://github.com/cajaun/laminar",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react-native", "reanimated", "expo", "typescript"],
        useFor: [
          "laminar",
          "animate changing text",
          "animate numbers",
          "morphing text",
          "rolling digits",
          "animated counter",
          "odometer",
          "number transition",
        ],
        description:
          "React Native component that animates changing text and numbers while preserving the identity of characters that stay on screen, so a label or counter rewrites itself in place instead of cross-fading the whole string. By Cajaun Campbell (cajaun), MIT, about 57 stars, published as `react-native-laminar` at 1.4.4 with peers React 18+, React Native 0.74+ and Reanimated 3+. `Laminar` is the only component export and covers three jobs: `text` reconciles grapheme clusters with a longest common subsequence pass over the changed middle of a string, `number` left-pads and aligns digits by place value so only changed lanes animate, and `slots` rolls digits through a vertical reel. Four motion presets (default bezier at 380ms, smooth spring at 400ms, snappy at 350ms, bouncy at 500ms) with text defaulting to `default` and number and slots to `snappy`, plus props for stagger, autoSize, clipToBounds and align; the repo carries an Expo example app and a quality gate of 92 automated cases at 100% function coverage.",
      },
      {
        title: "Voltra",
        href: "https://github.com/callstackincubator/voltra",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react-native", "expo", "ios", "android", "swiftui"],
        useFor: [
          "live activities react native",
          "dynamic island react native",
          "android home screen widgets",
          "jsx live activity",
          "activitykit push",
          "react native widgets",
          "voltra",
        ],
        description:
          "React Native library that turns JSX into SwiftUI and Jetpack Compose Glance so you can ship iOS Live Activities, Dynamic Island layouts, and Android home-screen widgets without writing Swift or Kotlin UI. Open source from Callstack incubator (Saúl Sharma and Szymon Chmal), MIT, about 805 stars; packages are `@use-voltra/ios-client` and `@use-voltra/android-client` with Expo config plugins that wire native extension targets after `npx expo prebuild`. Supports hot reload, ActivityKit and FCM push updates, RN style props plus native modifiers, and TypeScript hooks such as `useLiveActivity`. Docs live at use-voltra.dev; Expo Go is not supported, use a Dev Client or bare RN.",
      },
      {
        title: "react-native-system-navigation-bar",
        href: "https://github.com/kadiraydinli/react-native-system-navigation-bar",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react-native", "android", "ios", "turbo-module"],
        useFor: [
          "system navigation bar",
          "hide status bar android",
          "immersive mode react native",
          "edge to edge android",
          "home indicator ios",
          "system bar color",
          "fullscreen react native",
        ],
        description:
          "React Native TurboModule for system chrome: hide and show navigation and status bars, immersive lean-back sticky and immersive modes, bar colors and icon styles, edge-to-edge layout, plus iOS home-indicator auto-hide and deferred system gestures. By Kadir Aydinli, MIT, about 292 stars on npm as `react-native-system-navigation-bar`. Version 3 is New Architecture only and needs React Native 0.76+; stay on 2.8.0 for the old architecture. Android is the full surface (including `getNavigationMode` and edge-to-edge checks for Android 15 color quirks); iOS APIs for the home indicator are dedicated methods rather than no-ops of the Android bar APIs.",
      },
      {
        title: "react-native-purchases",
        href: "https://github.com/RevenueCat/react-native-purchases",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react-native", "expo", "ios", "android", "billing"],
        useFor: [
          "react native in app purchases",
          "react native subscriptions",
          "revenuecat react native",
          "storekit react native",
          "google play billing",
          "iap react native",
          "subscription status tracking",
        ],
        description:
          "RevenueCat's open-source React Native client for in-app purchases and subscriptions across iOS, Android, and web billing, wrapping StoreKit, Google Play Billing, and the RevenueCat backend for products, purchases, entitlements, webhooks, and analytics. MIT, about 1,200 stars; minimum React Native 0.73 and Kotlin 1.8 on Android. Install with `npx expo install react-native-purchases`; Expo Go runs a Preview API Mode with mocks, so real purchases need a development build. Ships companion UI and store packages in-repo, docs at docs.revenuecat.com, and a MagicWeather sample under examples.",
      },
      {
        title: "react-native-ease",
        href: "https://github.com/appandflow/react-native-ease",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react-native", "ios", "android", "fabric", "nativewind"],
        useFor: [
          "react native ease",
          "lightweight react native animation",
          "declarative native animation",
          "easeview",
          "reanimated alternative simple",
          "core animation react native",
          "fabric only animation",
        ],
        description:
          "Lightweight declarative animations for React Native powered by Core Animation on iOS and Animator or SpringAnimation on Android, with no JS animation loop, worklets, or shared values. From Montreal studio App and Flow, MIT, about 950 stars; New Architecture / Fabric only (RN 0.76+, iOS 15.1+, minSdk 24). `EaseView` takes `animate` and `transition` (timing, spring, or none), supports enter animations via `initialAnimate`, per-property transition maps, looping, delays, and hardware layers on Android. Aimed at fade, slide, and scale on state change rather than gesture-driven or layout animations; includes an agent skill (`npx skills add appandflow/react-native-ease`) to migrate Reanimated or RN Animated, plus NativeWind and Uniwind entry points.",
      },
      {
        title: "React Native Workers",
        href: "https://github.com/ammarahm-ed/react-native-workers",
        dateAdded: "2026-08-01",
        kind: "library",
        stack: ["react-native", "hermes", "metro", "ios", "android"],
        useFor: [
          "react native worker",
          "background thread",
          "off the main thread",
          "multithreading react native",
          "web worker api",
          "shared memory",
          "offload parsing",
        ],
        description:
          "Real threads for React Native from Ammar Ahmed: each worker gets its own Hermes runtime with its own heap and event loop behind a Web Worker style API (postMessage, onmessage, terminate), so parsing, crypto, database and image work stops blocking the UI thread. A worker is its own Metro bundle graph rather than a serialized closure, so normal npm imports work inside it and it debugs as its own DevTools target with console.log forwarded to the host tagged by worker name. Ships SharedStore, SharedValue and SharedBuffer for C++ backed memory shared across runtimes, a UIWorker whose runtime sits on the platform main thread for UI-affine native calls, and typed two-way RPC through defineModule. MIT, 93 stars, requires the New Architecture with Hermes on React Native 0.81.4 or newer; UI exports like View and Animated throw inside a worker, and the README positions workers as complementary to Reanimated worklets rather than a replacement.",
      },
      {
        title: "The real cost of React Native animations",
        href: "https://expo.dev/blog/the-real-cost-of-react-native-animations-benchmarking-every-approach",
        dateAdded: "2026-07-19",
        description:
          "Expo's benchmark of what a React Native animation library actually costs per frame, measuring Ease, Reanimated, and the built-in Animated API on real iOS and Android devices. A reference for picking an animation approach from measured frame budgets instead of folklore.",
      },
      {
        title: "Card Expand (rselmi)",
        href: "https://rselmi.com/lab/card-expand",
        dateAdded: "2026-07-19",
        description:
          "Rayan Selmi's open source App Store style card expansion for React Native: tap a card and it fluidly grows from its grid slot to fullscreen, then drags down to dismiss while the background list scales and fades. Built with Expo, Reanimated 4 and Gesture Handler; it measures the card's rect, animates a clone between rect and fullscreen, and drives every movement from one shared progress value so nothing desynchronizes.",
      },
      {
        title: "React Native Reusables",
        href: "https://reactnativereusables.com/",
        dateAdded: "2026-07-13",
        description:
          "shadcn/ui-style, copy-paste component library for React Native and Expo, universal (works on web too) components styled with NativeWind. 8.5k GitHub stars from founded-labs, built on Nativewind/Uniwind primitives, with a shadcn-style registry CLI for adding components.",
      },
      {
        title: "React Native Audio API",
        href: "https://docs.swmansion.com/react-native-audio-api/",
        dateAdded: "2026-07-13",
        description:
          "Native audio library from Software Mansion giving React Native a Web Audio API-like interface, for real-time effects, visualization and multi-track playback consistent across iOS, Android and web. Targets sub-10ms latency, good enough that a real-time saxophone learning app (Odisei Music) ships on it in production.",
      },
      {
        title: "React Native data detector",
        href: "https://github.com/pablogdcr/react-native-data-detector",
        dateAdded: "2026-07-13",
        description:
          "Cross-platform text data detection for React Native, using NSDataDetector on iOS and ML Kit Entity Extraction on Android to find phone numbers, URLs, emails, dates and addresses in text, with both imperative and hook-based APIs. Small (291 stars) but exposes 15 selectable ML Kit language models on Android plus structured address parsing on iOS.",
      },
      {
        title: "Expo Demos",
        href: "https://expo.dev/demos",
        dateAdded: "2026-07-14",
        description:
          "Official gallery of demo apps built with Expo, showing real implementations of specific APIs and patterns you can reference or clone. Includes an Expo Router + native tabs demo and a Live Activities example, each with a direct link to its own cloneable source repo.",
      },
      {
        title: "Margelo",
        href: "https://margelo.com/",
        dateAdded: "2026-07-14",
        description:
          "Mobile app development studio specializing in high-performance React Native apps, known for widely used open-source libraries (Vision Camera, Nitro Modules and others) running on billions of devices. Founded by Marc Rousavy (Vision Camera creator); the team has shipped 192+ apps including work for Discord, Amazon, and MetaMask.",
      },
      {
        title: "NativeWind",
        href: "https://www.nativewind.dev",
        dateAdded: "2026-07-14",
        description:
          "Brings Tailwind CSS's utility classes to React Native, so styling mobile components uses the same className syntax as a Tailwind web project. Compiles classNames to native StyleSheet objects at build time via a Babel/Metro plugin, so there's no runtime CSS-in-JS cost.",
      },
      {
        title: "reactnative.se",
        href: "https://github.com/pontusab/reactnative.se",
        dateAdded: "2026-07-15",
        description:
          "Community showcase site listing React Native apps built in Sweden, by Pontus Abrahamsson. A lightweight static-site repo (just index.html plus an apps/ icon folder) that takes app submissions via pull request.",
      },
      {
        title: "React Native ExecuTorch",
        href: "https://github.com/software-mansion/react-native-executorch",
        dateAdded: "2026-07-15",
        description:
          "Software Mansion library for declarative on-device inference: LLMs, Whisper speech-to-text and vision models via hooks like useLLM and useWhisper, running fully offline once a model is bundled. Runs on Meta's ExecuTorch runtime and requires the New Architecture plus iOS 17+ or Android 13+; powers the shipped app Private Mind.",
      },
      {
        title: "React Native RAG",
        href: "https://blog.swmansion.com/introducing-react-native-rag-fbb62efa4991",
        dateAdded: "2026-07-15",
        description:
          "Software Mansion library pairing on-device embeddings with an ExecuTorch-run LLM so a full RAG pipeline executes on-device with no server round trip. Ships an example pairing the MiniLM-L6-v2 embedding model with a 1B-parameter Llama 3.2 QLoRA checkpoint, written by Software Mansion's Jakub Mroz.",
      },
      {
        title: "Expo Router v6",
        href: "https://expo.dev/blog/expo-router-v6",
        dateAdded: "2026-07-15",
        description:
          "File-based router for Expo that now forks parts of React Navigation directly instead of just wrapping it, and adds native tabs for a platform-native tab bar. Ships alongside Expo SDK 54 from 650 Industries, the team also behind Expo itself, not a third-party router wrapper.",
      },
    ],
  },
  {
    title: "JavaScript and TypeScript",
    links: [
      {
        title: "cizgile",
        href: "https://github.com/productdevbook/cizgile",
        dateAdded: "2026-09-01",
        kind: "library",
        stack: [
          "typescript",
          "slug",
          "unicode",
          "url",
          "i18n",
          "transliteration",
          "edge",
        ],
        useFor: [
          "url slug",
          "slugify",
          "slug from title",
          "transliterate",
          "turkish slug",
          "unicode slug",
          "clean url segment",
          "dedupe slugs",
        ],
        description:
          "Zero-dependency slug engine that turns any title into a URL segment, by productdevbook, MIT, published as cizgile. Every ASCII slug it emits is a valid RFC 3986 segment-nz-nc, so nothing needs percent-encoding and it cannot produce a bare dot, a double dot or an accidental scheme prefix. It covers 19 locales and 7 scripts (Latin, Cyrillic, Greek, Arabic, Armenian, Georgian, Dhivehi) with the non-Latin tables opt-in, so importing slugify alone ships only the Latin table: the Turkish locale renders Istanbul Sisli and Cig with its real diacritics as istanbul-sisli-ve-cig, and the German one turns Strasse spelled with an eszett into strasse where Django yields strae. Three entry points split the surface, the root for slugify, isSlug, createSlugger and truncateSlug, /transliterate for the script tables and defineLocale, and /uri for resolveUri, normalizeUri, relativize and punycode, all cross-checked against the WHATWG URL parser. ESM only, no runtime dependencies, Node 20+, Bun, Deno, browsers and edge workers, 78 stars and 26 commits.",
      },
      {
        title: "SnapDOM",
        href: "https://snapdom.dev/",
        dateAdded: "2026-08-29",
        kind: "library",
        stack: ["dom", "canvas", "svg", "screenshot"],
        useFor: [
          "dom to image",
          "element to png",
          "screenshot a div",
          "export chart as image",
          "html to image",
          "generate social card",
          "capture react component",
          "html2canvas alternative",
          "visual regression capture",
        ],
        description:
          "Browser library that captures a rendered DOM element as SVG, PNG, JPG or WebP, with plugins extending to GIF, video and standalone HTML. By Zumerlab, published as @zumer/snapdom, MIT, v2.23.2, zero dependencies, 7.9k GitHub stars and over 1m monthly downloads. The distinguishing move is that it starts from the element the browser already rendered instead of rebuilding the page in a second rendering engine, so web fonts, pseudo-elements, SVG references, backgrounds and open shadow roots travel with the capture. You capture once and then export to PNG, SVG, canvas, blob, JPG or WebP from that single result, which suits dashboard exports, social cards designed in HTML/CSS and deterministic component captures for visual regression. Named production users include LobeHub, TriliumNext, Tencent's tmagic-editor, SEEK's Playroom, AntV and MetaBrainz; a paid SnapDOM Pro plugin tier is announced as coming soon.",
      },
      {
        title: "Sugar High",
        href: "https://sugar-high.vercel.app/",
        dateAdded: "2026-08-10",
        kind: "library",
        stack: ["react", "remark", "markdown", "syntax-highlighting"],
        useFor: [
          "syntax highlighter",
          "highlight code blocks",
          "code block highlighting",
          "lightweight syntax highlighting",
          "zero dependency highlighter",
          "highlight code in react",
          "shiki alternative",
          "highlight fenced code",
        ],
        description:
          "Zero-dependency syntax highlighter by huozhi that returns HTML without touching the DOM, so it works in the browser, in Node and in server-rendered code blocks. Covers 25 built-in languages from TypeScript and Python to SQL, YAML and diff, folding dialects like JSX, TSX and Bash into their parent. Theming is plain CSS custom properties (--sh-keyword, --sh-string, --sh-comment) with a .sh__line class per line, so there is no theme file to load, and companion packages add a React Code and Editor pair plus a remark plugin that highlights fenced blocks from their fence metadata. MIT.",
      },
      {
        title:
          "Choosing a JavaScript Logging Library: The 2026 Definitive Guide",
        href: "https://blog.sentry.io/javascript-logging-library-definitive-guide/",
        dateAdded: "2026-07-22",
        description:
          "Sentry blog guide by Kyle Tryon (March 2026) comparing four JavaScript logging libraries for production, useful when picking one for a new project. Covers Pino (Node-only, fastest, 3.3 KB gzipped, 2016), Winston (most transports but largest at 38.3 KB, around since 2010), Bunyan (oldest at 2012, explicitly not recommended for new projects), and LogTape (newest at 2023, zero dependencies, tree-shakable, universal runtime). LogTape is the pick for cross-runtime support (Node, Deno, Bun, browsers, edge), with a claimed 2x speed over Pino.",
      },
      {
        title: "Making html_of_jsx 10x faster",
        href: "https://sancho.dev/blog/making-html-of-jsx-10x-faster",
        dateAdded: "2026-07-13",
        description:
          "Explains how static analysis sped up the html_of_jsx library by pre-computing the static parts of HTML at build time instead of runtime, separating dynamic content from fixed structure for a 2-12x speedup depending on nesting. Written by David Sancho; nested static elements jumped from about 2M to 27M renders per second, a roughly 12x throughput gain.",
      },
      {
        title: "Eloquent JavaScript: values",
        href: "https://eloquentjavascript.net/01_values.html",
        dateAdded: "2026-07-13",
        description:
          "Chapter 1 of Marijn Haverbeke's free, well-known JavaScript book, covering values, types and expressions from first principles. Now in its 4th edition (2024), the entire book is free under a Creative Commons license with runnable in-browser code sandboxes.",
      },
      {
        title: "Eloquent JavaScript: program structure",
        href: "https://eloquentjavascript.net/02_program_structure.html",
        dateAdded: "2026-07-13",
        description:
          "Chapter 2 of Eloquent JavaScript, covering control flow, functions and how JavaScript programs are structured. Ends with the classic FizzBuzz exercise plus a triangle-printing and chessboard-grid drill to practice loops and conditionals.",
      },
      {
        title: "Exploring JS",
        href: "https://exploringjs.com/",
        dateAdded: "2026-07-14",
        description:
          "Axel Rauschmayer's free, deeply detailed online book covering modern JavaScript language features from the ground up, often used as a language reference rather than a beginner tutorial. Actually a set of standalone free books (Impatient JS, Deep JS, and more), first launched in 2015 and updated with each new ECMAScript edition.",
      },
      {
        title: "You Don't Know JS",
        href: "https://github.com/getify/You-Dont-Know-JS",
        dateAdded: "2026-07-13",
        description:
          "Kyle Simpson's book series digging into JavaScript's actual mechanics (scope, closures, this, prototypes, async), aimed at developers who use JS daily but want to understand why it behaves the way it does. Has 185k+ GitHub stars and is licensed CC BY-NC-ND, so no commercial reuse or derivatives; the current edition spans 2019-2025, sponsored partly by Frontend Masters.",
      },
      {
        title: "Myers diff algorithm",
        href: "https://www.30secondsofcode.org/js/s/myers-diff-algorithm/",
        dateAdded: "2026-07-13",
        description:
          "Explains and implements the Myers diff algorithm in JavaScript, the same algorithm behind `git diff` and most text-diffing tools. Eugene Myers published the underlying O(ND) algorithm in 1986; this article breaks down its greedy edit-graph traversal in plain JavaScript.",
      },
      {
        title: "30 seconds of code",
        href: "https://www.30secondsofcode.org/js/p/1/",
        dateAdded: "2026-07-13",
        description:
          "Library of short, copy-paste JavaScript snippets for common tasks, each explained in a few lines, for when you want a working solution without pulling in a dependency. Started in 2017 as a single JS snippet list, it has since spun off sister collections in Python, CSS, and React under the same project.",
      },
      {
        title: "VisualizeJS",
        href: "https://visualizejs.com/javascript",
        dateAdded: "2026-07-14",
        description:
          "Interactive, step-by-step visualizations of core JavaScript runtime concepts (event loop, closures, promises, memory) across 15 topics from beginner to advanced. Built solo by developer Tornike Nizharadze, it renders live call stack, heap, and garbage collection frames rather than just diagrams of them.",
      },
      {
        title: "types.kitlangton.com",
        href: "https://types.kitlangton.com",
        dateAdded: "2026-07-14",
        description:
          "Visualizer for TypeScript type structures, for seeing how a complex generic or conditional type actually resolves. Built by Kit Langton, better known from the Scala ZIO ecosystem, using the TypeScript Compiler API to re-render the type tree live as you edit.",
      },
      {
        title: "VueUse",
        href: "https://github.com/vueuse/vueuse",
        dateAdded: "2026-07-15",
        description:
          "Collection of 200+ Vue Composition API utility functions (useMouse, useStorage, useFetch and similar), by Anthony Fu, works with both Vue 2 and 3. Fully tree-shakeable so bundlers only ship the functions you actually import, backed by 22k+ GitHub stars and 300+ releases.",
      },
      {
        title: "Shiki",
        href: "https://github.com/shikijs/shiki",
        dateAdded: "2026-07-15",
        description:
          "Syntax highlighter that reuses TextMate grammars and real VS Code themes for byte-for-byte accurate highlighting, the engine behind VitePress and Nuxt Content's code blocks. Runs the same Oniguruma regex engine as VS Code via WebAssembly, so highlighting works identically in-browser and in Node.",
      },
      {
        title: "magic-regexp",
        href: "https://github.com/danielroe/magic-regexp",
        dateAdded: "2026-07-15",
        description:
          "Compiled-away, type-safe, readable alternative to writing raw RegExp literals in TypeScript, by Daniel Roe. Hovering a match in a supporting editor reveals the exact compiled RegExp output, useful for debugging what the readable syntax actually produces.",
      },
    ],
  },
  {
    title: "Web platform, CSS and performance",
    links: [
      {
        title: "How modern browsers work",
        href: "https://addyo.substack.com/p/how-modern-browsers-work",
        dateAdded: "2026-07-13",
        description:
          "Addy Osmani newsletter post walking through what actually happens inside a browser between a URL request and pixels on screen: parsing, rendering, compositing and the performance implications of each step. Details V8's four-tier JIT ladder, including the Maglev compiler, which runs 20x slower than Sparkplug but 10 to 100x faster than TurboFan.",
      },
      {
        title: "A friendly intro to container queries",
        href: "https://www.joshwcomeau.com/css/container-queries-introduction/",
        dateAdded: "2026-07-13",
        description:
          "Josh Comeau's approachable explainer on CSS container queries, how they differ from media queries and when to reach for them instead. Published November 2024, it notes the CSS Working Group resisted container queries for roughly twenty years before browsers finally shipped them.",
      },
      {
        title: "Picture perfect image optimization",
        href: "https://bholmes.dev/blog/picture-perfect-image-optimization/",
        dateAdded: "2026-07-13",
        description:
          "Deep dive on responsive image optimization on the web: srcset, sizes, formats and the picture element, aimed at shipping the right image for the right device. By Ben Holmes (May 2021), it walks through cutting a blog post's image load time down from 10 seconds using @11ty/eleventy-img and Sharp.",
      },
      {
        title: "SVG tutorial",
        href: "https://svg-tutorial.com/summary",
        dateAdded: "2026-07-14",
        description:
          "Interactive, slide-based SVG tutorial starting from circles and rectangles and working up to paths, bezier curves, animation and dynamic transforms. Created by Hunor Marton Borbely, the roughly 30-slide deck lets you drag live controls on quadratic and cubic Bezier curves right in the browser.",
      },
      {
        title: "WebHaptics",
        href: "https://haptics.lochie.me/",
        dateAdded: "2026-07-14",
        description:
          "Demo of haptic (vibration) feedback for the mobile web, showing how to add tactile response to web interactions instead of only visual/audio feedback. Runs on the standard Navigator.vibrate() Vibration API, so its tap patterns fire on Android Chrome but stay silent on iOS Safari, which never implemented it.",
      },
      {
        title: "WebVitals",
        href: "https://webvitals.com/",
        dateAdded: "2026-07-14",
        description:
          "Free tool for measuring a site's real-world Core Web Vitals from actual user data, surfacing speed and responsiveness issues to fix. Built and maintained by Sentry, it's free and reports live LCP, INP, CLS, FCP and TTFB from your own current page load rather than archived CrUX data.",
      },
      {
        title: "Media Cheatsheet",
        href: "https://mediacheatsheet.com",
        dateAdded: "2026-07-14",
        description:
          "Quick reference for common CSS media query breakpoints, saving a trip to check exact device widths. Covers social platform crop safe-zones too, e.g. Instagram/Facebook guidance to keep elements 250px from top, 340px from bottom.",
      },
      {
        title: "Turbopack persistent build cache",
        href: "https://nextjs.org/blog/next-16-3-turbopack",
        dateAdded: "2026-07-15",
        description:
          "Next.js 16.3 announcement extending Turbopack's cache to production builds, not just dev, citing roughly 90% dev memory reduction on Vercel's own large internal apps. On nextjs.org itself the new build cache cut Turbopack compile time from 21s to 9.2s, roughly 2.3x faster.",
      },
    ],
  },
  {
    title: "Frontend architecture and patterns",
    links: [
      {
        title: "Effective HTML",
        href: "https://www.effectivehtml.com/",
        dateAdded: "2026-08-03",
        kind: "directory",
        stack: ["html"],
        useFor: [
          "agent html artifacts",
          "html wireframes",
          "interactive html prototype",
          "implementation plan",
          "system diagram",
          "code review artifact",
          "visual design directions",
        ],
        description:
          "Reference site by Plannotator for building visual and interactive HTML artifacts with coding agents, useful when markdown cannot make structure, state or relationships inspectable. Its catalog contains 38 artifacts across nine subjects, including 20 references, 10 wireframes and mockups, and six reusable skills. Examples cover implementation plans, annotated pull requests, design systems, clickable flows, system diagrams, reports and focused editing tools, with live HTML and source links for the first-party artifacts.",
      },
      {
        title: "Editable Website",
        href: "https://editable.website/",
        dateAdded: "2026-07-19",
        description:
          "Open source SvelteKit template by Michael Aufreiter for websites you edit in place: press Cmd+E on the live page to edit text, add blocks, paste images and video, and reorder content, with no admin panel or CMS. Built on Svedit, his open source rich text editor, with SQLite persistence and full design freedom in plain HTML and CSS.",
      },
      {
        title: "Patterns.dev",
        href: "https://www.patterns.dev/",
        dateAdded: "2026-07-14",
        description:
          "Free book/reference on modern web app design patterns and rendering patterns (SSR, ISR, islands, and classic JS design patterns applied to React and Vue), from the team behind web.dev. Launched with Google Chrome's sponsorship, and frames its patterns as descriptive awareness, not a prescriptive checklist to follow.",
      },
      {
        title: "GreatFrontend blog",
        href: "https://www.greatfrontend.com/blog",
        dateAdded: "2026-07-13",
        description:
          "Blog from GreatFrontend covering front-end interview prep and practical engineering topics, system design, JavaScript internals, and framework-specific deep dives. Runs 86 published articles, written by Codeney Pte Ltd and pitched as curated by ex-interviewers from big tech.",
      },
      {
        title: "Fundamentals of Frontend Architecture",
        href: "https://frontendatscale.com/courses/frontend-architecture/foundations/introduction/",
        dateAdded: "2026-07-13",
        description:
          "Course on structuring large frontend codebases: module boundaries, state management strategy and architectural tradeoffs as an app scales past a handful of components. Taught by Maxi Ferreira, free, and structured as 38 videos across 5 modules from foundations through implementation.",
      },
      {
        title: "JSON Render",
        href: "https://json-render.dev/",
        dateAdded: "2026-07-14",
        description:
          "Generative UI framework where an AI generates JSON constrained to a predefined component catalog, streamed and progressively rendered in React or React Native, exportable as standalone code with no runtime dependency. Built by Vercel Labs, it ships 41 pre-built components (Card, Metric, Chart, Table) and uses Zod to validate the AI's generated JSON schema.",
      },
      {
        title: "Puck",
        href: "https://github.com/measuredco/puck",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted visual page builder for React: drag-and-drop editing on top of your own component library, for giving non-developers a CMS-like editing experience. MIT-licensed with over 13,000 GitHub stars; the npm package @puckeditor/core ships ready-made Next.js App Router and React Router v7 starter recipes.",
      },
      {
        title: "Workflow SDK",
        href: "https://workflow-sdk.dev/",
        dateAdded: "2026-07-14",
        description:
          "TypeScript library that makes async functions durable: automatic retries, state persistence and resumability, bringing reliability and observability to long-running JavaScript workflows and agents. Made by Vercel, the `workflow` npm package supports Next.js, Astro, Express, Fastify, Hono and NestJS, deployable self-hosted or on Vercel's managed platform.",
      },
      {
        title: "Styleframe",
        href: "https://www.styleframe.dev",
        dateAdded: "2026-07-14",
        description:
          "TypeScript library for writing type-safe, composable CSS for design systems. Generates CSS at build time for performance, with optional runtime styling, and works with React, Vue or Astro. The `styleframe` npm package compiles to zero-runtime CSS across Vite, Webpack, Rollup and six other bundlers, plus a Figma plugin for W3C DTCG token sync.",
      },
      {
        title: "Pure UI",
        href: "https://rauchg.com/2015/pure-ui",
        dateAdded: "2026-07-15",
        description:
          "Guillermo Rauch's 2015 essay arguing UI is a pure function of state, an early articulation of the thinking that shaped React's component model. Published November 2015 by Guillermo Rauch (later Vercel's founder), it's widely credited as the direct inspiration for Redux's 'UI = f(state)' mantra.",
      },
      {
        title: "Nitro",
        href: "https://nitro.build",
        dateAdded: "2026-07-15",
        description:
          "Universal server engine originally built inside Nuxt then extracted standalone; the same codebase deploys unmodified to Node, Cloudflare Workers, Deno, Bun, AWS Lambda, Vercel and Netlify. Nitro v3 (beta) is a ground-up rebuild on Rolldown and Vite v8, doubling down on web standards ahead of its next major release.",
      },
      {
        title: "fontaine",
        href: "https://github.com/danielroe/fontaine",
        dateAdded: "2026-07-15",
        description:
          "Daniel Roe's library that auto-generates font-fallback metrics to eliminate cumulative layout shift from web font loading. Built on Capsize plus Google Aurora team research, fontaine cut CLS from 0.24 to 0.054 in testing with zero runtime cost.",
      },
      {
        title: "beasties",
        href: "https://github.com/danielroe/beasties",
        dateAdded: "2026-07-15",
        description:
          "Daniel Roe's maintained fork of Critters: inlines an app's critical CSS and lazy-loads the rest. Beasties skips a headless browser entirely, unlike Critters, keeping it lightweight; roughly 680 GitHub stars and a good fit for SSR'd SPAs.",
      },
    ],
  },
  {
    title: "Icons",
    links: [
      {
        title: "Noun Project",
        href: "https://thenounproject.com/",
        dateAdded: "2026-08-18",
        kind: ["directory", "asset"],
        useFor: [
          "icon search",
          "stock icons",
          "svg icon library",
          "royalty free icons",
          "icon api",
          "powerpoint icons",
        ],
        description:
          "Icon and photo library running since 2010, at nearly 10 million vector icons and stock photos made by named human creators. Download PNGs in a chosen size and colour or take the SVG into Illustrator or Figma, with an in-browser editor for recolouring, rotation and effects; free downloads sit alongside a paid royalty-free license that carries more options. Plugins cover PowerPoint and Office, Figma and Adobe, plus a Mac app, and a REST API exposes the whole collection to teams like Adobe, Canva, Mural and Squarespace. Reach for it when you need one specific concept a designed icon set does not carry, not as your primary set.",
      },
      {
        title: "MX Icons",
        href: "https://github.com/ig-imanish/mx-icons",
        dateAdded: "2026-07-21",
        description:
          "React SVG icon library that ships each icon in outline, solid, and mini (16px) variants, for when you want one set that covers both heavier UI glyphs and tiny inline marks. Built by ig-imanish, distributed as a tree-shakeable npm package with React 18 or 19 as its only peer dependency, and props for size, color, and arbitrary SVG attributes. MIT licensed, around 74 stars, with a live demo at mx-icons.vercel.app.",
      },
      {
        title: "Iconiqui",
        href: "https://iconiqui.com/",
        dateAdded: "2026-07-14",
        description:
          "Icon-focused design system built on shadcn/ui and Motion, with subtle, functional animation that stays out of the way rather than drawing attention to itself. Built by edwinvakayil under Vercel's Open Source Program, Iconiqui components install directly into AI code editors via MCP integration.",
      },
      {
        title: "Animate UI icons",
        href: "https://animate-ui.com/docs/icons?icon=volume-1",
        dateAdded: "2026-07-13",
        kind: "library",
        stack: ["react", "motion", "icons"],
        useFor: ["animated icons", "hover icons", "lucide animated"],
        description:
          "Animated icon set from the Animate UI component library, each icon with a built-in hover/trigger animation instead of a static SVG. Built by Skyleen (imskyleen) on top of Lucide's icon set, open-sourced as animate-ui on GitHub with per-icon persistence and trigger controls.",
      },
      {
        title: "Phosphor Icons",
        href: "https://phosphoricons.com/",
        dateAdded: "2026-07-14",
        description:
          "Large, flexible open-source icon family with multiple weights (thin, light, regular, bold, fill, duotone), one of the most widely used icon sets in modern web UI. About 1,500 unique glyphs times 6 weights yield 9,000+ total icons, distributed as MIT-licensed packages for React, Vue, Svelte, and Figma.",
      },
      {
        title: "Reicon",
        href: "https://reicon.dev/usage/react",
        dateAdded: "2026-07-14",
        description:
          "React icon library with its own usage docs for dropping icons into a React app. Distributes handcrafted, not auto-generated, SVG icons as native packages for React, React Native, Vue, and Svelte, plus a dedicated Figma library.",
      },
      {
        title: "Heroicons Animated",
        href: "https://www.heroicons-animated.com/",
        dateAdded: "2026-07-13",
        kind: "library",
        stack: ["react", "motion", "icons"],
        useFor: [
          "animated icons",
          "heroicons animated",
          "react animated icons",
        ],
        description:
          "Open-source set of 316 icons that adds smooth Motion-powered animation on top of the original Heroicons, free under MIT for React projects. Built solo by developer Aniket-508 on GitHub as an unofficial add-on, not maintained by Tailwind Labs' official Heroicons team.",
      },
      {
        title: "Glyphs",
        href: "https://glyphs.fyi/dir?i=hourglass",
        dateAdded: "2026-07-14",
        description:
          "Icon directory site for browsing and picking glyphs, linked here to a specific hourglass icon entry. Functions as a dynamic Figma design system for generating custom icon sets from scratch, not just a static directory of premade glyphs.",
      },
      {
        title: "Smallbits",
        href: "https://smallbits.design",
        dateAdded: "2026-07-14",
        description:
          "Set of 290+ pixel icons constrained to an 8x8 grid, by Minor Adventures, minimalist icon design where every pixel counts. Offers SVG and PNG downloads under a pay-what-you-want model with tiers running from free up to $10.",
      },
      {
        title: "Gravity UI icons",
        href: "https://github.com/gravity-ui/icons",
        dateAdded: "2026-07-14",
        description:
          "Open-source icon set from Yandex's Gravity UI design system, consistent, interface-focused SVG icons free to use in any project. Ships as both React components and raw SVG files, MIT licensed, and plugs directly into @gravity-ui/uikit's Icon renderer.",
      },
      {
        title: "Icônes",
        href: "https://github.com/antfu-collective/icones",
        dateAdded: "2026-07-15",
        description:
          'Icon explorer by Anthony Fu searching 200,000+ icons across 150+ sets via the Iconify API, with instant local fuzzy search and one-click copy for multiple frameworks. Its "Bag" feature lets you collect chosen icons and export them together as a ready-to-use custom icon font.',
      },
      {
        title: "unplugin-icons",
        href: "https://github.com/unplugin/unplugin-icons",
        dateAdded: "2026-07-15",
        description:
          "Bundler plugin (Vite, Webpack, Rollup, esbuild) that turns any Iconify icon set into an importable component on demand, no icon font or sprite sheet needed. Built by Anthony Fu; pairs with unplugin-vue-components or unplugin-auto-import so icon components need zero manual imports.",
      },
      {
        title: "Eva Icons",
        href: "https://akveo.github.io/eva-icons",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["svg", "icons"],
        useFor: ["static icons", "outline icons", "filled icons"],
        description:
          "Open-source pack of carefully designed UI icons covering common interface actions and items, free to use in any project. Made by Akveo, the team behind the Nebular/ngx-admin design system; ships 480+ icons in matched outline and filled variants. Static set, not animated.",
      },
      {
        title: "Lineicons",
        href: "https://lineicons.com",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["svg", "icons"],
        useFor: ["line icons", "static icons", "icon pack"],
        description:
          "Free line-style icon pack with a large, consistent set of outline icons for interfaces and marketing sites. Ships 27,988+ premium icons across 10 unique styles and 60+ categories, free tier included, rated 4.9/5 on Product Hunt by 200k+ users. Static icon pack, not an animation library.",
      },
    ],
  },
  {
    title: "Animated icon libraries",
    links: [
      {
        title: "Material Line Icons",
        href: "https://icon-sets.iconify.design/line-md",
        dateAdded: "2026-08-13",
        kind: "library",
        stack: ["icons", "iconify", "css", "svg", "vue", "svelte"],
        useFor: [
          "animated icons",
          "css animated icons",
          "icons without javascript",
          "no js icon animation",
          "loading spinner icon",
          "icon draw animation",
          "iconify animated set",
          "line md icons",
        ],
        description:
          "Animated line icon set browsable through Iconify, 1,218 icons at the time of writing, for cases where the animation should cost no JavaScript at all. Built by cyberalien (who also authors Iconify) and MIT licensed, it follows the Round and TwoTone conventions of Material Design Icons and reaches for 1px thin lines where they help. Most icons use a rendering animation where shapes draw in one after another, a deliberate rejection of looping bounce effects, which the author argues pull focus off the content and keep the CPU busy draining mobile batteries. It ships in five formats: `svg-static`, `svg` (SVG animations level 2, not SMIL), `svg-style` with CSS in a style tag, `css-json` keeping SVG and CSS separate with hashed class names, and `svg-frames-120fps` for software that cannot animate at all. Names ending in `-loop` run forever and `-transition` morph between two icons. The CSS variants honour prefers-reduced-motion and cache cleanly, but wait on Safari, which as of late 2025 still lacks the `path()` CSS function for `d`.",
      },
      {
        title: "lucide-motion-vue",
        href: "https://respeak-io.github.io/lucide-motion-vue/",
        dateAdded: "2026-08-13",
        kind: "library",
        stack: ["vue", "nuxt", "motion", "icons", "lucide"],
        useFor: [
          "vue animated icons",
          "animated lucide vue",
          "nuxt animated icons",
          "motion-v icons",
          "hover animated icon",
          "animate icon on scroll",
          "vue 3 icon library",
        ],
        description:
          "Animated Lucide icons for Vue 3, 535 of them, built on Motion for Vue (`motion-v`) rather than a hand-rolled transition layer: `pnpm add @respeak/lucide-motion-vue motion-v`. Triggers are props, so `animateOnHover`, `animateOnTap` and `animateOnView` cover most cases without wiring state, and `triggerTarget` accepts `self`, `parent` or `closest:<selector>` so an icon can follow the hover state of the row or card containing it. Many icons carry several named animation variants selected through the `animation` prop, with Link2 alone shipping default, apart, unlink, unlink-loop and link. An `<AnimateIcon>` wrapper shares trigger state with nested icons through provide/inject, including a renderless template mode, and a Nuxt 3 module auto-registers everything under a configurable suffix (`<HeartAnimated>` by default) to avoid colliding with lucide-vue-next. From the respeak-io org, pure ESM with per-icon subpath imports for guaranteed separate chunks, SSR safe with hydration replay, and licensed in layers: MIT for the core, Lucide's ISC for the paths, and per-variant attribution for animations sourced from animate-ui and pqoqubbw.",
      },
      {
        title: "morphicons",
        href: "https://www.morphicons.com/",
        dateAdded: "2026-08-05",
        kind: "library",
        stack: ["react", "vue", "svelte", "react-native", "icons", "motion"],
        useFor: [
          "icon morph",
          "morph one icon into another",
          "animated icon transition",
          "menu to close icon",
          "svg path morphing",
          "hamburger menu animation",
          "cross library icon animation",
        ],
        description:
          "SVG icon morphing library for React, Vue, Svelte and React Native: pass a different icon and it animates the path transition, with no from/to pairs, wrapper components or keys. Built by Guillermo (guillermolg.com, repo guillermolg00/morphicons), it ships no icons of its own and instead consumes any stroke set as a `d` attribute or Lucide `IconNode`, so Lucide, Tabler, Heroicons, Iconoir, Akar, Untitled UI and Hugeicons interoperate on the shared 24x24 grid. The interesting part is the math: it solves shape correspondence in closed form with 2D Procrustes, so icons that are congruent under rotation simply rotate rather than morph, and rotation groups never have to be declared by hand. MIT with zero runtime dependencies; the project claims a 6.5 KB gzipped core, sub-millisecond morph planning and one shared rAF loop for every icon on screen.",
      },
      {
        title: "Icon Animator",
        href: "https://www.iconanimator.app/",
        dateAdded: "2026-07-16",
        kind: "tool",
        useFor: [
          "animate svg icons",
          "export lottie icons",
          "icon motion tool",
        ],
        description:
          "Web app for turning SVG icons into animated ones, adjusting motion, easing and timing in the browser, then exporting the result as code or Lottie for use in interfaces. Its Lottie export makes it the pick when you need the same animated icon to run natively in a mobile app, not just the browser.",
      },
      {
        title: "Lucide Animated",
        href: "https://lucide-animated.com",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["react", "motion", "icons"],
        useFor: ["animated icons", "lucide animated", "react animated icons"],
        description:
          "Free, open-source collection of 435+ animated React icons built on Lucide and Motion. Copy-paste ready, installable via the shadcn CLI, MIT licensed, with ports for Svelte, Vue, Angular and Flutter. Built by @pqoqubbw, it exposes an MCP server at lucide-animated.com/mcp so AI agents like Claude can search and fetch icons directly.",
      },
      {
        title: "Moving Icons",
        href: "https://www.movingicons.dev",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["svelte", "icons", "motion"],
        useFor: ["animated icons", "svelte animated icons"],
        description:
          "500+ hand-crafted, interaction-ready animated Lucide icons for Svelte 5. Tree-shakeable, zero dependencies, installable via npm or the shadcn-svelte registry, with animations controllable through props and hover states. Built solo by developer jis3r and MIT-licensed, with a default 24px size, 2px stroke, and a single `animate` boolean prop driving each icon.",
      },
      {
        title: "useAnimations",
        href: "https://useanimations.com",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["lottie", "react", "icons"],
        useFor: ["lottie icons", "animated icons", "react animated icons"],
        description:
          "Free library of 90+ handcrafted animated icons built on the Lottie framework, working across React, iOS and Android, with both looping and click-triggered playback. Authored by Patrik Svoboda; icons are optimized for a 32px grid and ship as both SVG and Lottie JSON via the react-useanimations npm package.",
      },
      {
        title: "Blendy",
        href: "https://blendy.tahazsh.com",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["svg", "motion"],
        useFor: ["icon morph", "svg morph", "icon transition"],
        description:
          "Library for morphing shapes smoothly from one icon or SVG into another, useful for animated icon-swap transitions instead of a hard cut. Solo project by Taha Shashtari offering 'dynamic' and 'spring' transition types, with framework-agnostic integration examples for React, Vue, and Svelte.",
      },
      {
        title: "Animate Icons",
        href: "https://animateicons.vercel.app",
        dateAdded: "2026-07-14",
        kind: "library",
        stack: ["react", "motion", "icons"],
        useFor: ["animated icons", "react animated icons", "hover icons"],
        description:
          "Collection of animated icon components for React, ready to drop into a project for hover and state-change micro-interactions. Made by Avijit Dey, packs 281 icons from Lucide and Huge on scoped subpaths, and installs as the @animateicons/react npm package built on Motion rather than copy-paste files.",
      },
    ],
  },
  {
    title: "UI kit directories",
    links: [
      {
        title: "BestWebsiteTemplate.com",
        href: "https://bestwebsitetemplate.com/",
        dateAdded: "2026-08-05",
        kind: "directory",
        stack: ["webflow", "framer", "shopify"],
        useFor: [
          "webflow template",
          "framer template",
          "shopify theme",
          "website template",
          "landing page template",
          "template directory",
          "buy a template",
        ],
        description:
          "Curated directory of website templates for Webflow, Framer and Shopify, useful when you want a vetted starting point instead of trawling a marketplace's own bestseller list. It is a discovery layer rather than a storefront: several reviewers independently assign each template a Design and a Dev score, the published number is the average of those, and nothing below an Overall Score of 7.0 gets listed, with creator reputation and sales volume ruled out as factors. Clicking a template sends you to the original creator's marketplace to buy, and each platform splits into free and paid. Supporting pages cover the scoring methodology, the review team, a platform comparison, a glossary and a build cost calculator, and the site is published in English, Spanish and Portuguese.",
      },
      {
        title: "Native Bloom",
        href: "https://nativebloom.dev/",
        dateAdded: "2026-07-24",
        description:
          "Curated catalog of React Native UI components, animations and patterns, useful when you want to find a ready block and hand your coding agent a prompt to build it rather than install a library. Built by Volodymyr Serbulenko; over 9,999 hand-reviewed blocks with new drops daily, each with a video preview and copy-ready agent prompt, searchable by title, component or animation and browsable by author, collection or package. Roughly 5% comes from paid collections and the rest from open source, npm packages, articles and social, with examples like Coverflow Carousel, Image Ripple Effect and Step Counter Number Flow. Free tier saves 12 blocks; Pro is $8/month and Team $12 per seat, billed annually.",
      },
      {
        title: "UI8",
        href: "https://ui8.net/",
        dateAdded: "2026-07-20",
        description:
          "Paid marketplace for design assets contributed by independent authors, useful when you want a finished Figma kit or template rather than a code library. Catalog runs to roughly 5,900 UI kits plus 1,430 illustrations, 1,364 icon sets, 1,137 themes, 908 mockups, 853 fonts, 644 presentations, 576 no-code assets and 346 coded templates. Products are sold individually with frequent site-wide sales, so check the current discount before buying a single item.",
      },
      {
        title: "DesEngs",
        href: "https://desengs.com/",
        dateAdded: "2026-07-20",
        description:
          "Directory of resources aimed at design engineers, sorted by what you would do with them rather than what they are: Read, Watch, Listen, Browse, Use, Build, Learn, Join. Curated by Maze Heart (remvze), 70+ entries added between March and July 2026, covering component libraries (Magic UI, Sonner, shadcn), color and typography tools, accessibility, and interaction design, alongside essays and job listings. Filterable by tag, open source on GitHub, with a random-resource button. Free.",
      },
      {
        title: "basecn",
        href: "http://basecn.dev",
        dateAdded: "2026-07-14",
        description:
          "shadcn/ui-style component distribution built on Base UI (the unstyled component library from the MUI team) instead of Radix primitives. Built by akash3444 on GitHub, ships default/comfortable/compact density variants per component, something Radix-based shadcn ports don't offer out of the box.",
      },
      {
        title: "smoothui",
        href: "http://smoothui.dev",
        dateAdded: "2026-07-14",
        description:
          "Copy-paste component library focused on smooth, physics-based motion and micro-interactions built with Tailwind and Motion. Installs per-component via `npx shadcn@latest add @smoothui/<name>`, MIT licensed, and mixes Motion with GSAP across 50+ components plus 22+ prebuilt blocks.",
      },
      {
        title: "Hexta UI",
        href: "http://hextaui.com",
        dateAdded: "2026-07-14",
        description:
          "Library of extended components and blocks built on top of shadcn/ui, offering ready-to-use foundation components that go beyond shadcn's default set. Solo project by Preet Suthar with theme design from matsugfx, browsable at /components with full source on GitHub for self-hosting.",
      },
      {
        title: "Tailark",
        href: "http://tailark.com",
        dateAdded: "2026-07-14",
        description:
          "Collection of reusable marketing site components built with shadcn/ui and Tailwind, hundreds of premium blocks and ready-made landing pages across multiple design styles. 200+ premium blocks sold as one-time-payment tiers ($249-$499, no subscription), plus a permanently free tier rather than a trial. The registry also ships illustrations at /illustrations, drawn for feature sections and bento grid cells, which is the part to raid when a marketing section needs art rather than another layout.",
      },
      {
        title: "Luxe UI",
        href: "http://luxeui.com",
        dateAdded: "2026-07-14",
        description:
          "Copy-paste component library aiming for an elegant, sophisticated visual style, built with React, Tailwind, Motion and Radix UI. Built solo by Gustavo Rodrigues (Guhrodrrigues), pitched by input-otp's creator as an aesthetic layer to drop on top of your existing design system, not replace it.",
      },
      {
        title: "Animate UI",
        href: "http://animate-ui.com",
        dateAdded: "2026-07-14",
        description:
          "shadcn/ui-style component library where every component ships with a built-in Motion animation, copy-paste like shadcn but animated by default. Solo project by imskyleen, sitting at 3.9k GitHub stars and 200 forks, MIT licensed.",
      },
      {
        title: "Magic UI",
        href: "http://magicui.design",
        dateAdded: "2026-07-14",
        description:
          "Popular free component library of animated, marketing-site-friendly effects (particles, beams, text animations) built on shadcn/ui and Tailwind. Created by Dillion Verma, over 150 components and 21.6k GitHub stars, explicitly pitched as a companion to shadcn/ui rather than a replacement.",
      },
      {
        title: "HeroUI",
        href: "http://heroui.com",
        dateAdded: "2026-07-14",
        description:
          "Full React UI library (formerly NextUI) built on Tailwind CSS and React Aria, providing accessible, themeable components as a complete design system rather than a copy-paste block collection. 29.9k GitHub stars and ships an MCP server plus agent skills for AI-native development, with tree-shakeable per-component packages like @heroui/button.",
      },
      {
        title: "Coss UI",
        href: "http://coss.com/ui",
        dateAdded: "2026-07-14",
        description:
          "Modern component library built on Base UI aimed at both human developers and AI coding agents, with 496+ pre-built components from basic buttons to complex dialogs, date pickers and command palettes. 10.3k GitHub stars with 499 individual components ('particles') to browse, built specifically on Base UI rather than Radix.",
      },
      {
        title: "Shoelace",
        href: "https://shoelace.style/",
        dateAdded: "2026-07-14",
        description:
          "Framework-agnostic library of standalone web components (custom elements), so components work the same in React, Vue, plain HTML or anything else without a JS framework dependency. Created by Cory LaViska and built on Lit; now folded into Font Awesome's Web Awesome lineup, with 60+ components at v2.20+.",
      },
      {
        title: "Shoogle",
        href: "https://shoogle.dev",
        dateAdded: "2026-07-14",
        description:
          "Search engine for the shadcn ecosystem: search blocks and components across many different shadcn registries at once, browse what's new, and bookmark favorites. Built as an indie side project specifically to end the pain of hunting the same shadcn block across a dozen scattered registries.",
      },
      {
        title: "termcn",
        href: "https://www.termcn.dev",
        dateAdded: "2026-07-14",
        description:
          "shadcn, but for terminal-themed UI components, copy-paste pieces styled to look like a terminal window. Built on Ink and OpenTUI rather than plain CSS, so its terminal look is rendered, not just styled to resemble one.",
      },
      {
        title: "formscn",
        href: "https://formscn.space",
        dateAdded: "2026-07-14",
        description:
          "shadcn, but for form components, copy-paste form fields and layouts styled to match shadcn/ui. Built by Abdullah Mukadam on Next.js 15 with Better Auth baked in, so 2FA, passkeys, and magic-link forms ship pre-wired.",
      },
      {
        title: "servercn",
        href: "https://servercn.vercel.app",
        dateAdded: "2026-07-14",
        description:
          'shadcn, but for server and infrastructure status components, uptime badges and status displays styled to match shadcn/ui. Built by Akkal Dhami with 28+ components on an Express/Node stack, following a zero-runtime-dependency "you own the code" philosophy.',
      },
      {
        title: "Flowkit UI",
        href: "https://flowkit-ui.vzkiss.com",
        dateAdded: "2026-07-14",
        description:
          "Component library that fills in UI patterns shadcn/ui doesn't ship, following shadcn conventions, including a Creatable Combobox that combines multiselect, autocomplete and inline item creation. Built by solo dev vzkiss on Base UI primitives rather than Radix, with keyboard navigation and ARIA baked into every control.",
      },
      {
        title: "Satis UI",
        href: "https://satisui.xyz",
        dateAdded: "2026-07-14",
        description:
          "React component library on top of shadcn/ui with Awwwards-inspired, GSAP-powered animated components, built with Next.js, TypeScript and Tailwind for copy-paste use. Made by Senior Design Engineer Satish Kumar; standouts include a 3D Drifting Marquee carousel and a Fanned Card Stack.",
      },
      {
        title: "bundui",
        href: "https://bundui.io",
        dateAdded: "2026-07-14",
        description:
          "shadcn/ui-based component and block library for quickly assembling marketing and app pages from copy-paste pieces. Ships 100+ components and 98 blocks spanning marketing, e-commerce, real estate, and dashboard categories in one library.",
      },
      {
        title: "shadcnstore",
        href: "https://shadcnstore.com",
        dateAdded: "2026-07-14",
        description:
          "Marketplace of shadcn/ui blocks and page templates, both free and paid, for faster page assembly. 165+ blocks (90+ marketing, 40+ e-commerce, 40+ app) sold as one-time-payment tiers up to $499, no subscription required.",
      },
      {
        title: "Joly UI",
        href: "https://www.jolyui.dev/docs/components",
        dateAdded: "2026-07-14",
        description:
          "50+ free shadcn/ui components for React and Next.js, copy-paste ready, combining accessibility with Framer Motion and WebGL-driven animation across buttons, text effects, inputs and navigation. Built by Johuniq; its Liquid Metal Button uses an actual WebGL shader, not CSS tricks, for the metallic distortion effect.",
      },
      {
        title: "Assistant UI",
        href: "https://www.assistant-ui.com",
        dateAdded: "2026-07-14",
        description:
          "React component library specifically for building AI chat interfaces: message streams, tool-call rendering and input handling out of the box. Ships integrations for LangGraph, Vercel AI SDK, MCP, and even terminal (react-ink) and React Native chat UIs, not just web.",
      },
      {
        title: "9ui",
        href: "https://www.9ui.dev",
        dateAdded: "2026-07-14",
        description:
          "Minimal shadcn-style component library with a pared-back visual style. Built on Base UI (not Radix) by solo dev borabalogluu, an open-source alternative for teams avoiding Radix's dependency tree.",
      },
      {
        title: "ui-layouts",
        href: "https://www.ui-layouts.com",
        dateAdded: "2026-07-14",
        description:
          "Copy-paste library of animated Tailwind layout components for building page sections quickly. Founded by Naymur, offers 100+ blocks including a novelty 'Mac Genie' dock-style component with genie-effect animation.",
      },
      {
        title: "hookcn",
        href: "https://hookcn.ouassim.tech",
        dateAdded: "2026-07-14",
        description:
          "shadcn, but for React hooks: copy-paste, well-typed hooks distributed the same way shadcn/ui distributes components. Built by Ouassim (strlrd29), and installs directly through the actual shadcn CLI itself rather than a separate registry command.",
      },
      {
        title: "shadcnui-blocks",
        href: "https://www.shadcnui-blocks.com/blocks",
        dateAdded: "2026-07-14",
        description:
          "Free shadcn/ui page section blocks for assembling landing pages without building every section from scratch. Run by Akash (akash3444), with 219 blocks spanning 31 categories plus a paid Pro tier for more polished variants.",
      },
      {
        title: "buouui",
        href: "https://buouui.com/docs",
        dateAdded: "2026-07-14",
        description:
          "Minimal shadcn-style component library with a pared-back visual style. Built with GSAP, Framer Motion, and React Three Fiber under the hood, and even ships a Zod-validated multi-step form pattern.",
      },
      {
        title: "MynaUI",
        href: "https://mynaui.com",
        dateAdded: "2026-07-14",
        description:
          "Free, beautifully designed UI component library aimed at giving indie projects a polished look without a design team. Created by designer Praveen Juge, who also publishes a free public Figma community file mirroring the full 50+ component set.",
      },
      {
        title: "HyperUI",
        href: "https://www.hyperui.dev",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source Tailwind CSS component library with a large catalog of marketing and application UI sections to copy and paste. Made by Mark Meyer; every section ships with a built-in dark-mode class variant and needs zero JavaScript to work.",
      },
      {
        title: "tocn",
        href: "https://tocn.vercel.app",
        dateAdded: "2026-07-14",
        description:
          "shadcn, but for terminal-themed components: copy-paste UI pieces styled to look like a terminal window. Installs with one command, `npx shadcn add tocn.vercel.app/r/table-of-contents.json`, for a scroll-spy TOC with an animated tree indicator.",
      },
      {
        title: "Geist Design System",
        href: "https://vercel.com/geist",
        dateAdded: "2026-07-15",
        description:
          "Vercel's open-sourced design system: React components, guidelines and the Geist Sans/Mono type family, the visual language behind Vercel's own products. Components install via the `@vercel/geistcn` package, and the whole spec is machine-readable at `/design.md` for LLM tooling.",
      },
    ],
  },
  {
    title: "Component libraries and blocks",
    links: [
      {
        title: "GPUI Component",
        href: "https://longbridge.github.io/gpui-component/",
        dateAdded: "2026-08-29",
        kind: "library",
        stack: ["rust", "gpui", "desktop"],
        useFor: [
          "rust desktop ui",
          "rust gui framework",
          "native desktop components",
          "rust data table",
          "code editor component",
          "dock layout",
          "gpui components",
          "zed gui framework",
        ],
        description:
          "Rust desktop UI framework built on GPUI, the GPU-drawn framework behind Zed, with 60+ finished components covering data tables, docking, charts and a code editor. Built by Longbridge and running in Longbridge Pro from day one; Apache-2.0, 13.6k GitHub stars, macOS, Windows and Linux. It splits into three layers: gpui-component for the full themed system, gpui-base for zero-style primitives that keep full accessibility behaviour while handing you 100% visual ownership, and gpui-shell for JavaScript extensions running in-process with hot reload on save and no capability granted by default. The heavy pieces are the reason to look: virtual-scrolling tables with fixed and resizable columns over hundreds of thousands of rows, a rope-backed editor stable at 200K lines with Tree-sitter highlighting and LSP diagnostics, and serializable dock layouts. Installed as a git dependency rather than a published crate version; icons come from Lucide and Isocons.",
      },
      {
        title: "Markdown Graphs",
        href: "https://mdx-graphs.kshv.me/",
        dateAdded: "2026-08-29",
        kind: "library",
        stack: ["react", "mdx", "shadcn", "motion"],
        useFor: [
          "ascii charts",
          "mdx graphs",
          "monospace dashboard",
          "github contribution grid",
          "shadcn chart blocks",
          "text only charts",
          "graph in markdown",
        ],
        style: "terminal",
        description:
          "React components for tables, charts and diagrams in MDX that look like monospace text: dashed frames and block characters, not SVG. Copy into a shadcn project via the registry (`pnpm dlx shadcn@latest add <origin>/r/graph-table.json`, or `/r/all.json` for the set). Thirty named graphs on the docs page including Table, Flow, Bars, Rank, Cells, Meter, Spark, Tree, Timeline, Stack, Funnel, Gantt, Plot, Waffle, Diff, Invoice, Compare, Stat, KPI, Spec, Activity, Heatmap, Calendar, Waterfall, Uptime, Slope, Bullet, Timer, Countdown, and a shared Frame. Default is one accent color, with palette duo or multi when a second hue is needed. Entrance animations stay under 220ms and do not loop. Needs an existing shadcn project plus motion. Not an npm package. Open source, files also copyable from GitHub. Maker is not named on the site beyond the kshv.me domain.",
      },
      {
        title: "Tremor Grid Lists",
        href: "https://blocks.tremor.so/blocks/grid-lists",
        dateAdded: "2026-08-29",
        kind: "library",
        stack: ["react", "tailwind", "tremor"],
        useFor: [
          "grid list blocks",
          "dashboard member cards",
          "integration cards",
          "tremor blocks",
          "copy paste dashboard ui",
          "workspace card grid",
        ],
        style: "product-dense",
        description:
          "Fifteen copy-paste dashboard grid-list blocks from Tremor Blocks, each with a live preview and React source using @tremor/react and Remix Icon. Patterns run from member cards with initials and email, through role and last-active splits, grid-versus-table tabs, integration cards with Connected or Enable, pipeline status chips, workspace quotas, report lists with avatars, and order fulfilment rows. This URL is the Grid Lists section, not the whole block catalog. File bugs at tremorlabs/tremor-blocks-issue-tracker.",
      },
      {
        title: "vibeprompts.dev",
        href: "https://vibeprompts.dev/footer/",
        dateAdded: "2026-08-19",
        kind: "directory",
        stack: ["tailwind", "prompts"],
        useFor: [
          "ui prompt library",
          "prompt for a landing page",
          "tailwind snippets",
          "footer layouts",
          "prompt a hero section",
          "generate ui with a prompt",
        ],
        description:
          "Prompt library pairing a UI description with copy-paste Tailwind markup, aimed at people building interfaces by prompting rather than writing the layout. 251 entries across 15 sections, roughly 16 to 17 each: Auth Forms, Pricing, Features and Bento, Hero Sections, CTA Banners, Stats Bars, Nav Bars, Testimonials, Footer, FAQ, Dashboards, Onboarding, Blog and Content, Contact, plus a 22 entry Bonus set. Each card carries a preview, a one-line summary and its own page. This link lands on the Footer section, whose 16 cover multi-column sitemaps, a dark footer with a newsletter panel, an overlapping CTA card, dense regulated disclosure small print, docs prev and next bars, mobile accordions and office locations. Built with Astro, no pricing stated anywhere on the page.",
      },
      {
        title: "Liquid Gooey",
        href: "https://gooey.jakubantalik.com/",
        dateAdded: "2026-08-19",
        kind: "library",
        stack: ["react", "typescript", "svg"],
        useFor: [
          "gooey effect",
          "metaball ui",
          "merge two elements",
          "liquid button",
          "blob morph",
          "elastic trail",
        ],
        description:
          "React library by Jakub Antalik for gooey merge effects, not the glass kind despite the name: wrap UI in a Liquid container, animate Liquid.Item positions, and touching pieces merge, reshape and dissolve into each other. Two modes, Morph for merging and Move for a liquid rubber trail behind a moving element, with playground sliders for goo blur and contrast so you can lift working parameters straight into a product. Ships as the liquid-gooey npm package out of the Jakubantalik/Libraries TypeScript monorepo (around 2.1k stars) alongside Border beam and Thinking orbs, with the demo site on Cloudflare Pages. Works in Safari, which is where most SVG goo filter techniques fall apart.",
      },
      {
        title: "Interaction Kit",
        href: "https://interactionkit.org/",
        dateAdded: "2026-08-18",
        kind: "library",
        stack: ["react"],
        useFor: [
          "copy paste react components",
          "notification reveal",
          "hold to delete",
          "image expand",
          "emoji picker",
          "tooltip component",
          "spring button",
        ],
        description:
          "Twelve copy-ready React components for the quiet details that make an interface feel considered, each with its own demo page: image expand, image modal, icon morph, emoji picker, search expand, notification reveal, spring button, hold to delete, tabs, text highlight, tooltip and code block. Each one is labelled by the job it does (state feedback, deliberate action, context on demand, press feedback) rather than by widget name, which makes the list usable as a checklist when auditing an interface for missing feedback. Built by Armond Schneider with source at github.com/armondschneider/interactionkit; there is no install command or license on the site, so copy the source rather than expecting a package.",
      },
      {
        title: "Coachmark",
        href: "https://sglza.xyz/coachmark",
        dateAdded: "2026-08-13",
        kind: "library",
        stack: ["react", "base-ui", "accessibility", "onboarding"],
        useFor: [
          "product tour",
          "coach mark",
          "onboarding tour",
          "guided walkthrough",
          "feature tour component",
          "spotlight overlay",
          "base ui popover",
          "highlight ui element",
        ],
        description:
          "Unstyled React primitive for product tours, built on Base UI's Popover so each step anchors to a target ref instead of a hand-rolled overlay. It ships no stylesheet at all: the fourteen parts (Root, Trigger, Backdrop with a spotlight cutout, Step, Positioner, Popup as a dialog, Arrow, Stepper, Title, Description, Previous, Next, Close, Viewport) are styled through className, style, Base UI's render prop, or stable data-slot attributes, and a useCoachmark hook exposes stepIndex, stepCount, isFirstStep, isLastStep, motionState plus next, previous, goTo, close and finish. The part worth stealing is out-of-view handling: it conceals the current mark, scrolls the next target into view (page or nested scroll container), then shows the next step, with enter, exit and step-transition motion states published as data attributes on the backdrop, positioner and popup so the animation stays in CSS. By Santiago Angeles (sglza), MIT, `npm i coachmark` against React 18 or newer, with Tailwind and CSS Modules examples, a playground for side, align, offsets, spotlight padding and radius, and docs mirrored as markdown at /coachmark.md.",
      },
      {
        title: "pdfcn",
        href: "https://www.pdfcn.dev/",
        dateAdded: "2026-08-13",
        kind: "library",
        stack: ["react", "shadcn", "pdf"],
        useFor: [
          "pdf components",
          "react pdf invoice",
          "generate pdf in react",
          "shadcn pdf",
          "pdf document blocks",
          "invoice pdf template",
          "takumi pdf",
          "forme pdf",
        ],
        description:
          "Copy-paste React PDF components installed through the shadcn CLI, for invoices, reports and other generated documents instead of hand-rolled renderer primitives. Same component API on two engines, Takumi and Forme: `npx shadcn@latest add @pdfcn/takumi/text` or `@pdfcn/forme/text`. The registry lists 23 primitives twice (alert, data table, graph, QR code, signature, watermark, page header/footer/number, keep-together, and so on), 10 document blocks per engine (six invoice styles plus financial, marketing, operations and security reports), and nine theme presets such as Professional, Executive, Blueprint and Forest. Lives under the shadcn-labs org as pdfcn, MIT licensed, with an llms.txt index and a site agent skill.",
      },
      {
        title: "Beautiful UI",
        href: "https://www.beautifului.dev/",
        dateAdded: "2026-08-12",
        kind: "library",
        stack: ["ai", "agents", "llm", "chat-ui"],
        useFor: [
          "ai chat ui components",
          "agent ui components",
          "reasoning trace ui",
          "streaming text component",
          "human in the loop ui",
          "tool call ui",
          "prompt bar component",
          "agent task status",
        ],
        description:
          "Copy-paste primitives for the parts of an interface an agent has to talk through, which is exactly the set most component libraries skip. Nineteen components cover the loading state, the expandable thinking trace with Steps, Reasoning, Search and Coding tabs, streamed answers with inline sources and follow-up chips, human-in-the-loop approval cards, tool calls as compact chips, and running, failed or completed agent task rows. Around the chat surface it adds a prompt bar with @ sources, / commands, a model picker and dictation, recommendation cards with a confidence meter, retrieved context cards, a diff table for AI-proposed edits to tabular data, a command palette, and selection actions for explain, improve, shorten, tone and grammar; several ship variants rather than one look, so the loader has Drive, Dots and Orbit and the prompt bar has Rounded and Pill, and every demo runs on the same fictional creamery data. Built by product design studio Turbo, with no framework, licence, price or repository named on the page and an email list as the only next step, so plan on rebuilding from the demos unless a code path turns up.",
      },
      {
        title: "emailcn",
        href: "https://emailcn.run",
        dateAdded: "2026-08-06",
        kind: "library",
        stack: ["react", "email", "shadcn", "mjml", "typescript"],
        useFor: [
          "email components",
          "html email template",
          "react email blocks",
          "transactional email ui",
          "marketing email layout",
          "email hero section",
          "responsive email",
        ],
        description:
          "Ready-made email sections distributed through the shadcn CLI, so a campaign or transactional email starts from installed components instead of hand-written table markup. It targets three renderers, React Email, MJML React and JSX Email, and you pick which one at install time: pnpm dlx shadcn@latest add @emailcn/react-email/image-grid-hero drops the source into your repo to own and edit. Blocks are whole sections rather than primitives (header with logo and menu, image grid hero, product list, call to action, navigation footer), grouped by marketing and ecommerce use, with built-in themes matching Vercel, Linear, Stripe, GitHub, Notion, Raycast, Twitch, Airbnb and Slack. Built by Aniket Pawar under the shadcn-labs org, MIT licensed, around 128 stars since April 2026.",
      },
      {
        title: "crd-ui",
        href: "https://crd-ui.juanda.co/",
        dateAdded: "2026-08-05",
        kind: "library",
        stack: ["react", "vue", "svelte", "javascript", "stripe"],
        useFor: [
          "credit card component",
          "card preview",
          "payment form card",
          "checkout card ui",
          "credit card input",
          "stripe elements preview",
          "card brand detection",
        ],
        description:
          "Single-purpose credit and debit card preview component for React, Vue, Svelte and vanilla JS, dependency free and themeable entirely through CSS custom properties. Built by Juan David Garcia (JuandaGarcia/crd-ui): one Card with props for number, name, expiry, cvc and focus, live brand detection across 10 networks including Elo and Hipercard, and two layouts, a form preview that flips the card on CVC focus and a display layout for saved cards that moves expiry and CVC to the front with no flip. Display only by design, which is the point: it pairs with Stripe Elements so digits stay inside Stripe's iframes while only brand and focus metadata drive the preview, with a brandFromStripe() helper and a Vite example app. Ships 6 variants, an optional pointer-tracked tilt with glare, 45 CC0 background images cut to the card aspect ratio, and deliberately generic brand marks since no trademarked artwork is bundled.",
      },
      {
        title: "Bearnie table",
        href: "https://bearnie.dev/docs/components/table/",
        dateAdded: "2026-08-05",
        stack: ["astro", "tailwind"],
        useFor: [
          "astro components",
          "astro component library",
          "astro tailwind",
          "table component",
          "html table markup",
          "bearnie",
        ],
        description:
          "Docs page for Bearnie's table: eight structural components (Table, TableHeader, TableBody, TableFooter, TableRow, TableHead, TableCell, TableCaption) that wrap native HTML table elements instead of a data engine, so there is no sorting, pagination or column API to learn and the only documented prop is class. Bearnie is an accessible Astro and Tailwind component library by Michael Andreuzza, MIT licensed at michael-andreuzza/bearnie with 290 stars, spanning roughly 49 components from Accordion to Typography. Install one at a time with npx bearnie add table (or the bunx, pnpm dlx and yarn dlx equivalents), which copies the code into your project so you own and edit it rather than importing a package. Worked examples cover a captioned invoice list, a totals footer row and badges inside cells; every docs page offers View as Markdown plus Open in Claude and Open in ChatGPT, and the site documents an MCP server for pulling components into an agent.",
      },
      {
        title: "Liveline",
        href: "https://benji.org/liveline",
        dateAdded: "2026-07-30",
        description:
          'React component for real-time animated line charts: a single canvas element, no dependencies beyond React 18, wired up with just two props (`data` and `value`). Install via `npm install liveline`; the default renders at 60fps with an 8% lerp speed per frame, and ships momentum arrows, three time-window selector styles, a candlestick toggle, multi-series overlays with toggle chips, orderbook streaming labels, crosshair scrubbing, and a "degen mode" with particles and chart shake. Released February 16, 2026, with early review from Shayne Coplan and credited inspiration from Polymarket\'s real-time prediction charts.',
      },
      {
        title: "Drawesome",
        href: "https://benji.org/drawesome",
        dateAdded: "2026-07-30",
        description:
          'React drawing toolbar component: seven pen types (pencil, pen, fineliner, marker, highlighter, brush, fountain pen) plus an eraser, with a toolbar that morphs shape instead of swapping panels. Install via `npm install drawesome`, described as two lines to drop into an app; it fills its parent container and ships SVG and PNG export, draggable and repositionable toolbar placement (bottom, left, right), light, dark, or auto themes, keyboard shortcuts, stroke-level erasing, and speed-responsive pen thickness on some tools. No dependencies beyond React. Published July 29, 2026, with the creator calling the opinionated defaults "the version you ship."',
      },
      {
        title: "Toolcraft",
        href: "https://toolcraft.sh/",
        dateAdded: "2026-07-29",
        description:
          "Open-source starter kit from Pixel Point for building creative tool interfaces, the kind with a canvas, toolbar, layer list, timeline, and keyframes already wired together. The component set is the part you would not want to hand-roll: sliders, colour palettes, curve editors, font pickers, gradient tools, and vector editing controls. It also ships agent skills, performance instructions, and visual testing rules so Claude, Codex, or Cursor generate consistent output inside it, which is unusual for a UI kit. Scaffold with `npx @pixel-point/toolcraft create`; the gallery has five example apps (Textures, Watercolor, ASCII, Bricks, Shaders).",
      },
      {
        title: "Great UI",
        href: "https://www.great-ui.com/components",
        dateAdded: "2026-07-29",
        description:
          "Copy-and-paste React and Tailwind component collection, small but weighted toward set pieces rather than form primitives. Sixteen components across five categories: Illustrations is the largest with seven (Mobile Mockup, Macbook Mockup, Vinyl Album Card, ASCII Image, Image Hover Reveal, Avatar Stack, Diagonal Marquee Carousel), then Buttons with three, Utilities with three (Deployment Checklist, Terminal Loader, Revision Timeline), Navigation with two (Page Transition Shader, Animated Link), and Inputs with one (Animated Select). Several lean on GLSL fragment shaders and spring animation rather than CSS alone, so the shader-backed page transition and ASCII image are the ones worth reading the source of. No pricing, license, or install command is stated on the site.",
      },
      {
        title: "Lifeline",
        href: "https://lifeline-evil-rabbit.vercel.app/",
        dateAdded: "2026-07-26",
        description:
          "Timeline component system by evilrabbit for laying out a career, a company history, or a personal journey as dated milestones, horizontal and scroll-scrubbed on desktop, vertical on mobile. Milestones carry hover-reveal images, draggable photo cards, video clips with lightbox expansion, mentor rows with portraits, and inline company badges; there is an intro sweep on load, keyboard navigation, reduced-motion support, and a fireworks easter egg. Ships as a shadcn registry with separately installable pieces: `npx shadcn@latest add evilrabbit/lifeline/page` for the full page, `/shell`, `/lifeline` for the component system alone, `/theme-switcher`, or the personal, company, and journey starter templates. Needs Next.js App Router, Tailwind v3 or v4, lucide-react, and next-themes. MIT licensed.",
      },
      {
        title: "Lightswind UI",
        href: "https://lightswind.com/",
        dateAdded: "2026-07-24",
        description:
          "React component library of animated UI elements and ready-made blocks you install with a shadcn-style CLI (`npx lightswind@latest add [component]`) and own the source of. Built by Muhilan and team, with 151+ animated components, 100+ UI blocks, and 342+ app layout blocks, plus a Pro tier of 3D shader and WebGL elements. Built on React, Next.js, Tailwind CSS, TypeScript, and Framer Motion, with universal dark mode, design-token customization, and an MCP integration for AI assistants like Cursor. MIT licensed, currently at v3.1.30, with free and Pro tiers.",
      },
      {
        title: "Canvas UI",
        href: "https://canvasui.dev/",
        dateAdded: "2026-07-23",
        description:
          "Open source library of 24 HTML-in-canvas and WebGL components for creative visual effects (Blaze, Liquid, Glass, Shatter, Particle Reveal, VHS), installable with a single shadcn CLI command and also exposed to AI agents through an MCP server. Framework agnostic across React, Vue, Svelte, and vanilla TypeScript; components initialize only when mounted, pause off-screen, and respect reduced motion. HTML-in-canvas is fully supported only in Chrome behind an experimental flag, other browsers degrade to regular HTML while the pure WebGL effects work everywhere. MIT plus Commons Clause license, credited to David H Dev on GitHub.",
      },
      {
        title: "AI Canvas",
        href: "https://aicanvas.me/components/interactive-card-stack",
        dateAdded: "2026-07-23",
        description:
          "Open-core registry of animated React components, blocks, and design systems by GitHub user uiNerd16, built with Framer Motion and Tailwind and installable via one shadcn CLI command (npx shadcn add @aicanvas/interactive-card-stack) or through its MCP server. The linked Interactive Card Stack scatters five polaroid-style photo cards you can click to pull forward, drag sideways to cycle, or drive with arrow keys; it is self-contained, responsive down to 320px, reduced-motion aware, and themed for light and dark. The free library is MIT licensed, with a paid Andromeda Design System and templates layered on top.",
      },
      {
        title: "Jelly UI",
        href: "https://jelly-ui.com/#jelly-kbd",
        dateAdded: "2026-07-22",
        description:
          "Web Components library of 40 custom elements where real form controls meet soft-body physics, giving buttons, inputs, and keyboard keys (the linked jelly-kbd) a squishy tactile feel. Zero dependencies and framework-free: one script tag from jelly-ui.com loads the whole set, with built-in dark mode, right-to-left support, and WCAG AA color tokens. MIT licensed; the page credits bmson.com as the author.",
      },
      {
        title: "Evil Buttons",
        href: "https://www.evilbuttons.com/",
        dateAdded: "2026-07-22",
        description:
          "Registry of 31 animated button components built on shadcn/ui and Motion, leaning toward the mischievous end of micro-interactions rather than plain hover states. Includes SlideToDetonate, DontPressButton, CaptchaButton, HoldConfirmButton, GlitchButton, and ConfettiButton alongside more conventional ones like CopyButton, PillButton, and MorphStatusButton. Ships live previews, a playground, and one-command CLI installs, published by Radium Coders.",
      },
      {
        title: "AIcss",
        href: "https://www.aicss.dev/",
        dateAdded: "2026-07-22",
        description:
          "Copy-paste block library for the UI an AI agent renders mid-conversation, covering the states a chat surface needs beyond the message bubble. Groups its components into thinking and reasoning, tool and action states (web search, file diff, image generation), text outputs (streaming text, inline citations, code block), structured outputs (to-do list, data table, comparison table), and an agent input. Built by Kevin (@kvnkld), free to use, currently in beta at V1.2.",
      },
      {
        title: "Thinking Orbs",
        href: "https://orbs.jakubantalik.com/",
        dateAdded: "2026-07-22",
        description:
          "Animated thinking-orb component for AI and agent interfaces: a dotted orb loading indicator that signals a model is working, in place of a generic spinner. Ships six hand-tuned states and two sizes, with automatic light and dark theming. Built by designer Jakub Antalik as a standalone single-component site, like his Border Beam release.",
      },
      {
        title: "mcpcn",
        href: "https://www.mcpcn.dev/docs",
        dateAdded: "2026-07-19",
        description:
          "Anthropic's shadcn-style component library for MCP (Model Context Protocol) apps: copy-paste React components built on Base UI, installed as source files through the shadcn CLI. Ships complete composable patterns (messages, forms, payments, events, lists, maps, social content) with context-backed child components, typed data and action contracts, and theme-aware semantic color tokens.",
      },
      {
        title: "Awesome shadcn/ui",
        href: "https://awesome-shadcn-ui.vercel.app/",
        dateAdded: "2026-07-13",
        description:
          "Curated list of shadcn/ui-compatible component libraries, blocks, themes and tools, the map of the whole shadcn ecosystem in one page. Maintained on GitHub by birobirobiro with weekly additions, tracking hundreds of entries including 15+ SaaS starters and 20+ animation-focused UI libraries.",
      },
      {
        title: "Origin UI",
        href: "https://github.com/origin-space/originui",
        dateAdded: "2026-07-14",
        description:
          "Large, well-known collection of copy-paste components built on shadcn/ui and Tailwind, hundreds of ready-made pieces from form fields to complex widgets, one of the most popular shadcn extensions. Acquired by Cal.com and folded into coss.com/ui as a legacy snapshot, but the original repo still carries 10.3k GitHub stars.",
      },
      {
        title: "OriginKit",
        href: "https://originkit.dev",
        dateAdded: "2026-07-15",
        description:
          "Free library of animated interface components for adding polished motion and interactions to web projects. Ships 50 components fetchable through an MCP server, so AI coding tools can pull real source instead of regenerating animations from scratch.",
      },
      {
        title: "Fancy Components",
        href: "https://www.fancycomponents.dev/",
        dateAdded: "2026-07-14",
        description:
          "Component library focused on eye-catching visual effects (particles, distortions, creative hover states) for marketing sites that want to stand out. Open source on GitHub with standout one-off pieces like Image Trail, Gravity, and Marquee Along SVG Path rather than a full UI kit.",
      },
      {
        title: "Componentry",
        href: "https://www.componentry.fun/docs",
        dateAdded: "2026-07-14",
        description:
          "Growing collection of animated primitives for React spanning text animations, interactive components, hero backgrounds and visual effects. Built by Harsh Joshi with about 40 components across text, interactive, hero-background, and effect categories, several driven by WebGL shaders for liquid, prismatic looks.",
      },
      {
        title: "React Bits",
        href: "https://reactbits.dev/",
        dateAdded: "2026-07-14",
        description:
          "Library of animated UI components for React, motion-enhanced, ready-to-use interface elements for adding visual polish quickly. Built by DavidHDev; each component ships in four code variants, JS or TS crossed with plain CSS or Tailwind, so you pick your stack.",
      },
      {
        title: "Intent UI",
        href: "https://intentui.com/components",
        dateAdded: "2026-07-14",
        description:
          "Accessible React component library built on React Aria with 80+ production-ready components, positioned as 'copy, customize, and own your UI' rather than a locked-in dependency. Made by Irsyad under MIT license; beyond components it bundles 1000+ blocks, patterns, and starter kits across Next.js, Laravel, and Vite.",
      },
      {
        title: "Unlumen UI",
        href: "https://ui.unlumen.com/",
        dateAdded: "2026-07-14",
        description:
          "React component library offering both free and premium ready-to-use UI elements. Built and maintained by a single developer (wicki-leonard-emf on GitHub) rather than a team, giving it a smaller, more curated catalog than rivals.",
      },
      {
        title: "Watermelon UI",
        href: "https://ui.watermelon.sh/animated-components/category/tabs",
        dateAdded: "2026-07-11",
        description:
          "Animated component library, this link points at its tabs category, showing motion-driven tab navigation components. Ships as a shadcn-style registry, so tab components install via the shadcn CLI straight into your project's file structure instead of manual copy-paste.",
      },
      {
        title: "Eldora UI",
        href: "https://www.eldoraui.site/docs",
        dateAdded: "2026-07-14",
        description:
          "Component library of animated, copy-paste React pieces, including creative hover effects like card flips. Made by Karthik Mudunuri and past 1,900+ GitHub stars, explicitly modeled on shadcn/ui's architecture with Aceternity- and Magic UI-style animation flair.",
      },
      {
        title: "Bklit charts",
        href: "https://ui.bklit.com/",
        dateAdded: "2026-07-14",
        description:
          "Chart component library from Bklit, styled data visualization components (line, bar, funnel and more) for React dashboards. Built by uixmat under Vercel's Open Source Software Program, it spans 17 chart types (candlestick, sankey, sunburst, gauge) and can export charts as video.",
      },
      {
        title: "Reactix",
        href: "https://www.reacticx.com/",
        dateAdded: "2026-07-14",
        description:
          "React component library offering ready-to-use UI pieces for building interfaces faster. A smaller, lesser-known React UI kit worth a quick look when Reactix/beUI/Nexvyn don't already have the specific piece you need.",
      },
      {
        title: "Nexvyn UI",
        href: "https://ui.nexvyn.dev/components/bounce-sidebar",
        dateAdded: "2026-07-11",
        description:
          "React component library emphasizing visual clarity and premium micro-interactions through physics-based animation, built with Framer Motion and semantic tokens that adapt to light/dark mode. Installs via the shadcn CLI registry, ships WCAG 2.1 AA-compliant components built from scratch (no copied code or assets), and is free even for commercial use.",
      },
      {
        title: "beUI",
        href: "https://beui.dev/components/blocks/overflow-actions",
        dateAdded: "2026-07-11",
        description:
          "React motion component library with 30+ animated pieces, including an overflow-actions pill rail that springs open to reveal extra controls. By GitHub's starc007, it totals 51 pieces (33 motion components plus 18 blocks) with a $149 lifetime Pro tier for extra premium blocks.",
      },
      {
        title: "ReUI",
        href: "https://reui.io/components/tooltip",
        dateAdded: "2026-07-14",
        description:
          "shadcn/ui-based component library with a broad catalog of individual components (this link points at its tooltip) plus full page patterns. Maintained by Keen Themes (keenthemes/reui on GitHub), its tooltip set alone ships 16 Radix UI-based variants with hover/focus triggers and configurable delay.",
      },
      {
        title: "Molecule UI",
        href: "https://www.moleculeui.design/docs/components/profile-menu",
        dateAdded: "2026-07-11",
        description:
          "Component library including pieces like a styled profile menu dropdown, for assembling app UI chrome quickly. Its component set stays deliberately narrow, app-chrome primitives like menus and dropdowns, rather than a sprawling all-in-one design system.",
      },
      {
        title: "Spectrum UI",
        href: "https://ui.spectrumhq.in/docs/multistepform",
        dateAdded: "2026-07-11",
        description:
          "React/Next.js component library spanning basic inputs to complex pieces like kanban boards, animated charts and multi-step forms. The multi-step form demo alone spans six stages, personal info through website goals, budget, and requirements, deeper than typical three-step wizard examples.",
      },
      {
        title: "Shark UI",
        href: "https://shark.vini.one/docs/components/tour",
        dateAdded: "2026-07-11",
        description:
          "Design system with reusable, customizable UI elements, including a guided product-tour component for onboarding flows. Built on headless Ark UI primitives and installed piece by piece through the shadcn CLI as @shark/tour, not a standalone package.",
      },
      {
        title: "GAIA UI",
        href: "https://ui.heygaia.io/docs/components/component-preview-tooltip",
        dateAdded: "2026-07-11",
        description:
          "Open-source component library with charts, cards, tooltips and interactive pieces, built for the HeyGaia product. Built by The Experience Company, it lazy-loads each preview component only on hover instead of rendering every preview upfront.",
      },
      {
        title: "Morphin",
        href: "https://morphin.dev/components/scroll-scramble-section",
        dateAdded: "2026-07-11",
        description:
          "Component library specializing in scroll-triggered text and layout effects, this link shows its scroll-scramble text component. Its scramble effect shuffles character glyphs as you scroll past the section rather than on click or hover, a scroll-tied matrix-style decode.",
      },
      {
        title: "uselayouts",
        href: "https://uselayouts.com/docs/components/animated-collection",
        dateAdded: "2026-07-11",
        description:
          "Component library including an Animated Collection piece that morphs between list, card and pack views with shared-element transitions. Installs with a single `npx shadcn add` command and drives the morph via Framer Motion springs tuned to stiffness 350, damping 30.",
      },
      {
        title: "Boneyard",
        href: "https://boneyard.vercel.app/overview",
        dateAdded: "2026-07-14",
        description:
          "Tool that generates pixel-perfect skeleton loading screens by capturing a component's real rendered layout: wrap it in a Skeleton tag, run the CLI, and get placeholder 'bones' as JSON, framework-agnostic. Built by 0xGF; install with `npm install boneyard-js`, and it targets React, Preact, React Native, Vue, Svelte, and Angular alike.",
      },
      {
        title: "Kairo UI",
        href: "https://www.kairoui.online/templates",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source landing page templates built with Next.js and Tailwind, installable with a single command. Currently ships 11 templates (Triggerly, Nova, Orbit, Aurora, Nexora among them), each clonable straight into a Next.js project.",
      },
      {
        title: "Liquid Glass OSS",
        href: "https://liquid-glass-oss.vercel.app/",
        dateAdded: "2026-07-11",
        description:
          "Open-source recreation of Apple's Liquid Glass visual effect for the web. Recreates Apple's iOS 26 Liquid Glass material (unveiled at WWDC 2025) as a live, in-browser preview, no native Apple hardware needed.",
      },
      {
        title: "framecn",
        href: "https://www.framecn.dev/",
        dateAdded: "2026-07-14",
        description:
          "shadcn/ui-compatible collection of video components built on Editframe, for embedding polished, customizable video UI pieces. Built on Editframe's rendering engine, so its components handle real video composition and export, not just playback chrome.",
      },
      {
        title: "tweakcn",
        href: "https://tweakcn.com/editor/theme",
        dateAdded: "2026-07-14",
        description:
          "Visual theme editor for shadcn/ui: tweak colors, typography and component styling interactively and export the resulting theme, open source. Built by solo developer jnsahaj and has crossed 20k GitHub stars, with a one-click Figma export for handoff.",
      },
      {
        title: "Code Blocks by pheralb",
        href: "https://code-blocks.pheralb.dev/",
        dateAdded: "2026-07-12",
        description:
          "Component collection for displaying code snippets with syntax highlighting, line numbers, diff notation, focus effects and line highlighting. Built by pheralb on Shiki for highlighting; install any block directly via `pnpm dlx shadcn@latest add <block>.json`.",
      },
      {
        title: "Shadcncraft tooltip",
        href: "https://shadcncraft.com/components/official-shadcn/tooltip",
        dateAdded: "2026-07-13",
        description:
          "Design system built on shadcn/ui offering production-ready components and blocks with matching Figma files, this link shows its tooltip component; serves 9,000+ builders. Spans 108 components total (55 free official shadcn/ui plus paid Pro Marketing, Application, and E-Commerce tiers).",
      },
      {
        title: "mindmapcn",
        href: "https://mindmapcn.vercel.app/docs/installation",
        dateAdded: "2026-07-13",
        description:
          "shadcn/ui-compatible mind map component for React, with automatic light/dark theming via OKLCH colors. Wraps ssshooter's mind-elixir engine as a shadcn CLI block; a ~75-star project, install via `shadcn add mindmap.json`.",
      },
      {
        title: "Micro FAQs",
        href: "https://micro.bossadizenith.me/components/faqs",
        dateAdded: "2026-07-13",
        description:
          "Small, focused component from a library of reusable UI pieces (carousels, forms, navigation, accordions), this link shows its FAQ accordion component. Its scrolling-question, focused-answer layout is explicitly credited to designer Dan Hollick rather than an original pattern.",
      },
      {
        title: "Vengeance UI",
        href: "https://www.vengenceui.com/components/twisting-ribbon",
        dateAdded: "2026-07-13",
        description:
          "Component library featuring unusual, high-motion effects, this link shows its twisting ribbon component. Built entirely with Canvas 2D and requestAnimationFrame math (not CSS) by creator Ashutosh, one of 50+ components in the Vengeance UI library.",
      },
      {
        title: "jal-co JSON viewer",
        href: "https://ui.justinlevine.me/docs/components/json-viewer",
        dateAdded: "2026-07-13",
        description:
          "Open-source, always-free React/Tailwind component collection; this link shows its collapsible, syntax-highlighted JSON tree viewer with search and copy. Remembers each node's expand state and restores it when you clear a search, with zero dependencies beyond React and Tailwind.",
      },
      {
        title: "Evil Charts",
        href: "https://evilcharts.com/docs",
        dateAdded: "2026-07-14",
        description:
          "Copy-paste chart component library built on Recharts and shadcn/ui, styled data visualizations that look better than the defaults out of the box. Created by Gurbinder, a design engineer at Axiom.co, layering Motion.dev animations on top of Recharts rather than building a new charting engine.",
      },
      {
        title: "Eldora card flip hover",
        href: "https://www.eldoraui.site/docs/components/card-flip-hover",
        dateAdded: "2026-07-13",
        description:
          "Card component from Eldora UI that flips on hover to reveal a back face, a common pattern for feature or team cards. Needs just one `imageUrl` prop, built by Karthik Mudunuri as part of the Eldora UI beta library already used by 1,000+ developers.",
      },
      {
        title: "Border Beam",
        href: "https://beam.jakubantalik.com/",
        dateAdded: "2026-07-14",
        description:
          "Animated border-beam component for React: a light trail travels around an element's border, a popular highlight effect for cards and buttons. Standalone implementation hosted on creator Jakub Antalik's own domain, distinct from the similarly named Border Beam shipped in Magic UI's registry.",
      },
      {
        title: "React Wheel Picker",
        href: "https://react-wheel-picker.chanhdai.com/",
        dateAdded: "2026-07-13",
        description:
          "iOS-style scrollable wheel picker component for React, the kind of control used for date/time or option selection on mobile. Built by ncdai (chanhdai.com), installs via `npx shadcn add @ncdai/wheel-picker`, and has drawn public praise from React creator Jordan Walke.",
      },
      {
        title: "RigidUI",
        href: "https://www.rigidui.com/docs/hooks/use-location",
        dateAdded: "2026-07-13",
        description:
          "React component and hooks library; this link shows its useLocation hook, which handles browser geolocation and reverse geocoding via OpenStreetMap. Returns loading, coordinates, and address state in one hook, using free OpenStreetMap Nominatim reverse geocoding with no API key required.",
      },
      {
        title: "Solace UI",
        href: "https://www.solaceui.com/sections/hero-section",
        dateAdded: "2026-07-13",
        description:
          "Component library of full page sections, this link shows a hero section example, for assembling marketing pages from bigger building blocks than single components. Ships as copy-paste code via the shadcn CLI rather than an npm package, so you own and directly edit each section's source.",
      },
      {
        title: "tnks data table",
        href: "https://github.com/jacksonkasi1/tnks-data-table",
        dateAdded: "2026-07-13",
        description:
          "Advanced React data table component with server-side sorting, filtering and pagination, backed by Hono.js, Drizzle ORM and PostgreSQL rather than doing the work client-side. MIT-licensed with 243 GitHub stars; its v0.4.0 release (Nov 2025) added hierarchical subrows on top of the Hono.js/Drizzle/Postgres stack.",
      },
      {
        title: "Driver.js",
        href: "https://driverjs.com/",
        dateAdded: "2026-07-14",
        description:
          "Lightweight, dependency-free library for building product tours and onboarding walkthroughs: highlight an element, attach a popover, and step through a guided sequence. About 5KB with zero dependencies, pulling roughly 4.3M npm downloads a month while staying framework-agnostic across React, Vue, Angular, and vanilla JS.",
      },
      {
        title: "use-gesture",
        href: "https://use-gesture.netlify.app/",
        dateAdded: "2026-07-14",
        description:
          "React (and vanilla JS) library from the pmndrs ecosystem for handling drag, pinch, wheel, scroll and hover gestures with a single consistent hook. Maintained by pmndrs (creators of Zustand, drei, Jotai); each gesture (useDrag, usePinch) also works standalone outside the combined hook.",
      },
      {
        title: "Tripwire dither kit",
        href: "https://www.tripwire.sh/dither-kit",
        dateAdded: "2026-07-13",
        description:
          "Dithering effect kit from Tripwire for applying retro, halftone-style dither patterns to images or UI in a web project. Pure Canvas (no WebGL/shaders), built on motion and D3, ships dithered charts, avatars, and buttons via a shadcn CLI installer.",
      },
      {
        title: "beUI motion radio",
        href: "https://beui.dev/components/motion/radio",
        dateAdded: "2026-07-13",
        description:
          "Animated radio button component from beUI's motion component set. Uses motion/react with a shared layoutId dot for spring-based gliding selection, and honors prefers-reduced-motion via useReducedMotion().",
      },
      {
        title: "Skiper UI drag and scroll",
        href: "https://skiper-ui.com/v1/skiper5",
        dateAdded: "2026-07-13",
        description:
          "Drag-and-scroll interaction component from Skiper UI's numbered component series, for building draggable horizontal scroll galleries. Framer Motion recreation of the Things app's infinite drag-and-scroll grid feel; install with `pnpm dlx shadcn add @skiper-ui/skiper5`.",
      },
      {
        title: "Klick Here",
        href: "https://klick-here.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Small interactive demo site, minimal enough that its exact purpose isn't documented beyond the click interaction itself. A bare single-word page with no copy, credits, or stack info visible; treat it as a raw interaction sandbox, not a reference.",
      },
      {
        title: "Torph (lochie)",
        href: "https://torph.lochie.me",
        dateAdded: "2026-07-14",
        description:
          "Dependency-free animated text transition component, framework-agnostic with ports for React, TypeScript, Vue and Svelte, installable via npm for morphing text effects. Built solo by Lochie (@lochieaxon); ships as the npm package `torph`, currently at v0.0.9.",
      },
      {
        title: "Fluid Functionalism",
        href: "https://www.fluidfunctionalism.com",
        dateAdded: "2026-07-14",
        description:
          "Animated component library with a tactile, fluid feel to its interactions, one of the sources this registry ports components from. Made by @micka_design; its 22 Radix/Base UI components include a proximity-hover state that highlights the nearest item before you click.",
      },
      {
        title: "Trophy UI",
        href: "https://ui.trophy.so",
        dateAdded: "2026-07-14",
        description:
          "Open-source React gamification kit built on shadcn/ui and Tailwind: production-ready streak trackers, achievement badges, leaderboards and points displays as copy-paste components. MIT-licensed and built by Trophy.so, spanning roughly 17 components across streaks, achievements, leaderboards, and points/levels categories.",
      },
      {
        title: "LiveKit Agents UI",
        href: "https://livekit.com/products/agents-ui",
        dateAdded: "2026-07-14",
        description:
          "Prebuilt UI components from LiveKit for building voice AI agent interfaces: waveforms, transcripts and call controls out of the box. Its Aura audio visualizer, co-designed with Unicorn Studio, renders an undulating energy field via a custom WebGL shader across five agent states.",
      },
      {
        title: "Sileo",
        href: "https://sileo.aaryan.design",
        dateAdded: "2026-07-14",
        description:
          "React toast notification library with SVG morphing, spring physics and a minimal API, described as 'beautiful by default'; available via npm with a docs playground. Built by Aaryan (Hiaaryan) and published to npm as the `sileo` package under an MIT license.",
      },
      {
        title: "ReUI patterns",
        href: "https://reui.io/patterns",
        dateAdded: "2026-07-14",
        description:
          "Full-page UI pattern examples (not just single components) built with shadcn/ui, useful as reference for assembling whole screens. Built by keenthemes with 1,019+ shadcn/ui components and 3.1K GitHub stars, shipping each in both Radix UI and Base UI variants.",
      },
      {
        title: "shadcnthemer",
        href: "https://shadcnthemer.com",
        dateAdded: "2026-07-14",
        description:
          "Visual theme editor for shadcn/ui: tweak colors, radius and spacing live and export the resulting theme config. Built solo by developer Mike Tromba (open-sourced as shadcn-themer on GitHub), and it doubles as a browsable gallery of community-submitted themes.",
      },
      {
        title: "ElevenLabs UI",
        href: "https://ui.elevenlabs.io",
        dateAdded: "2026-07-14",
        description:
          "Official component library from ElevenLabs for building voice AI interfaces, matching the components they use in their own products. Its standout Orb component renders a WebGL/Three.js 3D orb with real-time audio reactivity, installed like any shadcn registry via the CLI.",
      },
      {
        title: "Plate",
        href: "https://platejs.org",
        dateAdded: "2026-07-14",
        description:
          "Rich text editor framework for React, the kind of building blocks behind Notion-style editors, with a plugin system for extending it rather than building a WYSIWYG editor from scratch. Created by Zbeyens, Plate has 16k GitHub stars and ships an AI-powered editor template installable in one command via the shadcn CLI.",
      },
      {
        title: "AI Elements",
        href: "https://github.com/vercel/ai-elements",
        dateAdded: "2026-07-15",
        description:
          "Vercel's shadcn/ui registry built specifically for AI SDK apps: chat bubbles, streaming responses, reasoning blocks, tool-call UI and prompt input, installed the same way as any shadcn component. Vercel's registry has 2.2k GitHub stars, installs via `npx ai-elements@latest`, and layers directly onto the Vercel AI SDK's streaming primitives.",
      },
      {
        title: "Nuxt UI",
        href: "https://ui.nuxt.com",
        dateAdded: "2026-07-15",
        description:
          "Vue component library built on Reka UI and Tailwind CSS, 110+ components; v4 merged the formerly paid Pro tier and Figma kit into the free MIT-licensed release. Ships built-in i18n support for 50+ languages and WAI-ARIA compliant primitives inherited from Reka UI, not just styling utilities.",
      },
    ],
  },
  {
    title: "Component demos and micro-interactions",
    links: [
      {
        title: "Nav.Supply",
        href: "https://nav.supply/",
        dateAdded: "2026-08-18",
        kind: "demo",
        stack: ["framer"],
        useFor: [
          "navigation patterns",
          "mobile menu",
          "dropdown menu",
          "nav hide on scroll",
          "site header patterns",
          "framer remix",
        ],
        description:
          "Fourteen navigation patterns for Framer sites, free to remix, put together by Benjamin den Boer in 2024. The set is Centered Popout, Dropdowns Simple, Dropdowns to Accordion, Dropdowns Nested, Desktop Menu, Mobile Menu, Side Scroll, Appear On Scroll, Circular Overlay, Fixed Popover, Full Overlay, Sliding Sidebar, Mobile Menu Transitions and Expand At Top, which between them cover auto-collapsing navs and navs that hide on scroll. Every pattern has a live demo and 8 carry a walkthrough video, so it doubles as a catalogue of nav behaviours worth knowing even outside Framer.",
      },
      {
        title: "Maze UI Experiments",
        href: "https://remvze.com/ui/",
        dateAdded: "2026-08-18",
        kind: "demo",
        stack: ["astro"],
        useFor: [
          "ui experiments",
          "micro interaction demos",
          "hold to confirm",
          "image on hover",
          "morphing text",
          "circular text slider",
          "animated accordion",
        ],
        description:
          "Running index of small interaction studies on a personal site called Maze, 17 of them so far, each dated and on its own page. The list covers Compose Post Button, URL Shortening Interaction, Image on Hover, Circular Text Slider, Circular Share Menu, Morphing Text Animation, Image Gallery, Cancel Deletion, Copy to Clipboard, Text Highlight on Scroll, Animated Accordions, Hold to Confirm, Cookie Settings, Glowing Cards, Animated Placeholder, Animated Number Counter and Tab Bar Component, split between a December 2025 batch and a newer run through August 2026. Built with Astro on Geist; there is no package, license or author credit on the page, so these are techniques to read rather than a library to install.",
      },
      {
        title: "Lab by Tobi",
        href: "https://lab.tobi.computer/",
        dateAdded: "2026-08-11",
        kind: "demo",
        stack: ["canvas", "webgl"],
        useFor: [
          "ui experiments",
          "ui lab",
          "craft demos",
          "ui demos",
          "coverflow",
          "album stack",
          "stack to grid",
          "css experiments",
        ],
        description:
          "Personal lab of small UI demos and experiments by Tobi B., a frontend and UI engineer, for when you want a single interaction studied in isolation. The index counts five crafts and describes itself as a work in progress. The author's portfolio at tobi.computer lists the experiments individually, each on its own subdomain: a vertical coverflow album stack, a stack to grid transition, and a Baby Reindeer title screen recreation, alongside a mini tools project built with Canvas and WebGL. Recent frontend work credited there is Equal IQ and Cisco Systems.",
      },
      {
        title: "Pattern Cards (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/pattern-cards",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "next"],
        style: "marketing-motion",
        useFor: [
          "dot pattern card",
          "feature card row",
          "cursor driven dots",
          "dots scale toward cursor",
          "hover fade siblings",
          "card tilt on hover",
          "halftone card background",
          "falling particles card",
        ],
        description:
          'Three tall feature cards from the Whitespace studio playground, each filled with a dot pattern (arrow wedge, diagonal cascade, plus) that reacts to the cursor: dots swell into rings within a radius of the pointer, the hovered card tilts, and the other two fade back. Cards run black, orange (#ff6e00) and warm gray on a #e0dfdd ground, with real product copy such as "Instant: every action lands in under a second, no spinners". The site\'s own manifest files it as a direct port of a Figma layout, dated 19 May 2026, but the shipped version is fully parameterized through their DialKit panel: pattern size and dot scale, tilt perspective and pack iterations, particle spawn rate and fall speed. One of 30 experiments there, alongside Trace Cards, Shape Cards and Dot Hover Cards.',
      },
      {
        title: "Dot Sphere Card (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/dot-sphere-card",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["three", "canvas", "css"],
        useFor: [
          "css 3d card",
          "dot sphere",
          "hover reveal layers",
          "dithered background",
          "gradient banding fix",
          "cursor spotlight",
        ],
        description:
          "HUD card in CSS 3D where a cursor-reactive dot sphere floats over a tinted video layer and two textured asteroid GLBs orbit out from behind the card on hover. Carries real shadow-mapped shadows, a center-pinned cursor-tracking spotlight, per-layer hover choreography, and a TPDF-dithered background that removes gradient banding. The newest experiment on the Whitespace playground, dated 7 August 2026.",
      },
      {
        title: "Action Wheel (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/action-wheel",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "radial menu",
          "action wheel",
          "press and hold menu",
          "quadrant selector",
          "game style ui",
          "circular control",
        ],
        description:
          "Game-style radial action wheel: click and hold to summon a layered circular control built from a noise-animated dot grid, a segmented variable-stroke ring, and four quadrants that light as a cursor-chasing glow orbits the rim. The wheel tilts in 3D toward the pointer, and releasing over a quadrant confirms the choice. From the Whitespace playground, 3 July 2026, with live DialKit parameters.",
      },
      {
        title: "Cuboid Chain (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/cuboid-chain",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "3d card carousel",
          "barrel roll cards",
          "staggered rotation",
          "rounded cuboid",
          "card chain",
          "three point lighting",
        ],
        description:
          "Horizontal chain of rounded cuboids whose front faces carry task-card art, each barrel-rolling on the horizontal axis with a staggered phase under a top, bottom and side key light rig. Cuboid dimensions, gap, rotation speed, stagger and every light are exposed as live DialKit controls. From the Whitespace playground, 5 June 2026.",
      },
      {
        title: "Trace Cards (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/trace-cards",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "wireframe cards",
          "card tilt",
          "depth sculpt",
          "duplicate layer trail",
          "3d card hover",
        ],
        description:
          "Pyramid and diamond cards with cursor-driven tilt, depth sculpts and streaming duplicate layers, an R3F formation sitting over HTML chrome with DialKit controls. From the Whitespace playground, 24 May 2026, and the closest sibling to Pattern Cards on the same page.",
      },
      {
        title: "Dot Form 3D (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/dot-form",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f", "shadcn"],
        useFor: [
          "3d form",
          "extruded input",
          "form focus animation",
          "dot relief text",
          "tilted form",
        ],
        description:
          "A shadcn-style form that lifts into a tilted 3D scene on focus: inputs and checkboxes become extruded outlines, the button gains thickness, and typed characters render as a dot relief at varying heights. From the Whitespace playground, 27 April 2026, built with React Three Fiber and html-in-canvas.",
      },
      {
        title: "Dot Phone Carousel (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/dot-phone-carousel",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "phone mockup carousel",
          "scan transition",
          "dotted preview",
          "device frame carousel",
          "image cycle",
        ],
        description:
          "Centered phone mockup with a crisp screen while dotted preview images glide behind it on a horizontal carousel, each pulled through the phone with a scan transition as you cycle left and right. From the Whitespace playground, 22 April 2026.",
      },
      {
        title: "Cursor Nav (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/cursor-nav",
        dateAdded: "2026-08-10",
        kind: "demo",
        useFor: [
          "custom cursor nav",
          "cursor menu",
          "fake cursor",
          "pointer driven navigation",
          "steer with cursor",
        ],
        description:
          "A fake cursor that moves normally, then blooms into a 3D navigation mode on click, with selections steered by moving up and down. From the Whitespace playground, 21 April 2026, a reference for hanging navigation off pointer state rather than a fixed menu.",
      },
      {
        title: "Dot Hover Cards (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/dot-hover-cards",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "dot reveal hover",
          "halftone hover",
          "dots to html",
          "silhouette hover",
          "canvas to dom handoff",
        ],
        description:
          "Page filled with gray dots where hovering a card region turns those dots white to reveal its silhouette, then a click transitions the dots into sharp HTML. From the Whitespace playground, 17 April 2026, and the clearest demo of their dot-to-DOM handoff.",
      },
      {
        title: "Curtain Sidebar (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/curtain-sidebar",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas", "webgl"],
        useFor: [
          "sidebar reveal",
          "curtain effect",
          "page fold drag",
          "edge drag gesture",
          "paper fold transition",
        ],
        description:
          "Music streaming page whose sidebar reveals through a curtain deformation: drag from the left edge and the page folds like paper, rendered with html-in-canvas and WebGL. From the Whitespace playground, 16 April 2026.",
      },
      {
        title: "Shape Cards (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/shape-cards",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["svg"],
        useFor: [
          "generative cards",
          "random composition",
          "svg shape collage",
          "generated cover art",
          "palette regenerate",
        ],
        description:
          "Randomized geometric card compositions built from overlapping SVG shapes with curated palettes and glass-effect accents, regenerated on demand through DialKit controls. From the Whitespace playground, 4 April 2026, useful when you want generated cover art rather than hand-placed layouts.",
      },
      {
        title: "Folder Gallery (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/folder-gallery",
        dateAdded: "2026-08-10",
        kind: "demo",
        useFor: [
          "folder open animation",
          "image grid expand",
          "gallery reveal",
          "collect and scatter",
          "folder ui",
        ],
        description:
          "Click a folder to launch its images into a grid, hover to see it open with a glowing light beam, then click again to recall them. From the Whitespace playground, 31 March 2026, a compact reference for expand and collapse gallery choreography.",
      },
      {
        title: "Clay Toggle (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/clay-toggle",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["three"],
        useFor: [
          "3d toggle switch",
          "clay material ui",
          "soft toggle",
          "tactile switch",
          "weighty control",
        ],
        description:
          "Soft 3D toggle switch rendered in three.js with clay-like materials, subtle shadows and an eased flip on click. One of the smallest experiments on the Whitespace playground, 29 March 2026, and a reference for giving a binary control physical weight instead of a flat slide.",
      },
      {
        title: "Creativity Dial (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/creativity-dial",
        dateAdded: "2026-08-10",
        kind: "demo",
        useFor: [
          "temperature control",
          "ai parameter dial",
          "hud dial",
          "circular drag control",
          "precise to creative",
        ],
        description:
          "Circular HUD control for adjusting an AI temperature value, dragged between precise and creative while a particle field reacts in real time. From the Whitespace playground, 28 March 2026, and a compact reference for turning an abstract model parameter into something physical.",
      },
      {
        title: "Elastic Bars (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/elastic-bars",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "elastic bars",
          "rubber wave",
          "bar deformation",
          "mouse physics",
          "springy bars",
        ],
        description:
          "Vertical bars that deform elastically as the mouse moves, producing a rubber-like wave. One of the two oldest experiments on the Whitespace playground, 27 March 2026, and the one that spawned two productized variants there: Feature Cards, which uses the bar art as visual identity, and Elastic Dropdown, where the bars bend to fit unfolding content.",
      },
      {
        title: "Spritesheet pointer translate (jhey)",
        href: "https://x.com/jh3yy/status/2085007349232665023",
        dateAdded: "2026-08-05",
        kind: "demo",
        stack: ["css"],
        style: "marketing-motion",
        useFor: [
          "css spritesheet",
          "spritesheet animation",
          "pointer position css",
          "translate based on pointer",
          "hover frame scrub",
          "cursor driven frames",
          "css background position",
          "interactive spritesheet",
        ],
        description:
          "X post by jhey (@jh3yy, Shopify brand design studio) showing a CSS spritesheet character that scrubs frames by translating with pointer position, with a short blink as a grace-note idle. Published 5 Aug 2026 with a ~30s square 2160 video demo (no CodePen link in the post itself). Steal the technique: one sheet, CSS transform/background offset driven by clientX/Y, not a JS timeline of frame indices. Replies mention related site work such as pete.design mood sprites with easter-egg mouse hypnosis.",
      },
      {
        title: "Framer University Resources",
        href: "https://framer.university/resources",
        dateAdded: "2026-08-04",
        kind: ["library", "demo"],
        stack: ["framer"],
        useFor: [
          "framer components",
          "framer code override",
          "framer animation",
          "framer effects",
          "copy paste framer",
          "framer site rebuild",
          "learn framer",
        ],
        description:
          "Free library of copy-and-paste Framer resources: components, code overrides, animations and effects you drop into a Framer site rather than a React project. Run by Nandi Muzsik, who started posting Framer tutorials daily in January 2023 and took Best Framer Creator at the 2024 Framer Awards; it is an independent project, not an official Framer product, and the paid course sits separately at app.frameruniversity.com. Browse by Animations, Components, Effects, Interactions or Websites, and by tags including Tutorial, Copy & paste, Scroll animation, Site rebuild, Code override, 3D and Integration. Entries include a shader button, an Apple-style tooltip interaction, a blinds text reveal, a gooey dropdown, an x-ray hover effect, a depth globe and mobile haptics, each with a quick preview; the page loads 20 at a time and shows no total.",
      },
      {
        title: "interior.dev",
        href: "https://www.interior.dev/",
        dateAdded: "2026-08-01",
        description:
          "React micro-interactions built for the half-second after a click, distributed as files you copy rather than a package you install. Made by GitHub user ddoemonn (MIT, repo ddoemonn/interior), with motion.dev as the only runtime dependency; each file exports a headless useX hook that holds the behavior with no class names attached, plus a styled component on top of it as a replaceable example, so restyling means swapping classes instead of rewriting logic. The docs group components by what someone is in the middle of rather than by widget type: Action Feedback, Input, Async, Notification, Overlay, Navigation, Scroll, Data, Gesture and Content, with Poll Results suggested as the starting point. The rules it argues for are the part worth stealing: every reachable state reserves its width in advance so a Save to Saving swap does not shift the row, an interrupted spring resumes from where the element actually is instead of restarting, gestures account for being abandoned, and under prefers-reduced-motion the information still arrives without the animation.",
      },
      {
        title: "Animating icons",
        href: "https://www.bakai.me/lab/animating-icons",
        dateAdded: "2026-07-31",
        kind: ["demo", "essay"],
        stack: ["css", "icons", "motion"],
        useFor: [
          "animated icons",
          "css icon animation",
          "meaning driven icon motion",
          "icon morph",
        ],
        description:
          "Lab write-up by Bakai Tolondu uulu (Jul 23, 2026) on CSS-only icon animation where each gesture is the verb the icon already means, once: a key rotates, a stack gains a layer by occlusion rather than morphing, a plane leaves and returns by clipping instead of fading. Covers five mechanisms with live examples: true path morphs for hands (Muscle, OK, Sign, Palm, Love), keyframes for rigid parts (Stack, Database, CPU, Tree), travel-and-return (Airplane, Planet, Cash), stroke draw-on (Git branch, Truck), and animating holes via masks (Chat, Robot, Funnel). Timing rule is roughly one second per beat with a breath before play and a sped-up finish if you leave mid-gesture, not the sub-300ms UI-state rule. Ships the icons and an agent skill installable with `npx github:kai956/animating-icons`, plus prompt recipes for deriving the verb before writing keyframes.",
      },
      {
        title: "Morphing Icons with Claude",
        href: "https://benji.org/morphing-icons-with-claude",
        dateAdded: "2026-07-30",
        description:
          "Write-up of an icon system where any of 21 icons (menu, cross, plus, minus, equals, asterisk, more, check, play, pause, download, upload, external, four directional arrows, four chevrons) morphs into any other through actual shape tweening rather than a crossfade, animated with Motion.dev. The trick: every icon is built from exactly three SVG lines, with unused lines collapsed to invisible center points, and icons that share a rotation group (arrows at 90 degree increments, chevrons, plus and cross at 45 degrees) swap by rotating instead of moving coordinates, which reads smoother. Built with Claude Code, including a custom interactive sequencer for testing transitions; the author notes Claude nailed the functional morphs but needed human feedback to fix the visual quality of the rotation-based approach. Published January 13, 2026.",
      },
      {
        title: "On Repeat",
        href: "https://on-repeat-tau.vercel.app/demo/index.html",
        dateAdded: "2026-07-29",
        description:
          "Demo page for On Repeat, a set of drop-in music player components you can lift into any site. Three skins are live on the page: a vinyl record player, an iPod-style player, and a bar visualizer, each with its own demo route and a Load button that starts playback. The page frames distribution as a prompt you copy rather than a package you install, so the useful part is opening each player and reading how the transport controls and the audio-reactive artwork are wired.",
      },
      {
        title: "Animated Favicons: Live Demo",
        href: "https://favicon.im/blog/animated-favicon-live-demo",
        dateAdded: "2026-07-25",
        description:
          "Blog post from Favicon.im where the demo runs in the actual browser tab: six animation styles (pulse dot, spinner, progress ring, image flip, notification badge, and a GitHub-style flip) that you trigger on the page, with an 8x zoomed preview mirroring the real 16x16 icon. The technique is pure canvas, about 15 lines: draw the frame, export a PNG data URL, swap it onto the favicon link element. It also covers the OffscreenCanvas plus Web Worker pattern from the Aymkdn/animated-favicon library for keeping motion alive in background tabs, and is honest about support: Firefox animates unfocused tabs, Chrome and Edge throttle requestAnimationFrame in the background, Safari updates intermittently. Favicon.im itself is a free favicon lookup, conversion, and generator service handling 15M+ requests a month.",
      },
      {
        title: "Moumen Lab",
        href: "https://lab.moumen.dev/components",
        dateAdded: "2026-07-23",
        description:
          "Component lab by Moumen Soliman with 13 interactive UI experiments shown as short looping clips, each shipping the live component, its blueprint, and source you can copy or install via npx moumenlab add. The entries lean toward hard interaction problems rather than styling: an unlimited nested menu, a command palette with argument chips, a morphing checkout flow, a caret-anchored mention popover, an OTP segmented input, drag-to-reorder lists, and an inertial wheel list. Source lives on GitHub at moumen-soliman/lab.",
      },
      {
        title: "Sticker Forge",
        href: "https://sticker.oooo.so/",
        dateAdded: "2026-07-23",
        description:
          "Browser-based sticker lab by CatsJuice (cats_juice) where you design a text sticker and peel it off the page with simulated physics. Sliders cover typography (8 to 240px sizes, line height, color), stroke width and tilt, and a full peel model: curl radius, sticker hardness, wind, shadow intensity and softness, back gloss, even tear sound volume. Everything runs locally in the browser with no server uploads; worth studying for the peel interaction alone.",
      },
      {
        title: "Toggle Supply",
        href: "https://www.toggle.supply/",
        dateAdded: "2026-07-21",
        description:
          "A growing collection of hand-coded, open-source components for modern web development by Jaret Peerson, sorted by New, Old, or alphabetically and grouped by category. Good for studying one self-contained interaction at a time and adapting the technique. Current entries include GitHub Contributions (a contribution graph), Scroll-Driven Card Reveal, an Expandable Directory dropdown, two hover effects (Expand Image on Hover, Circle Mask Reveal on Hover), and a Lightbox with Controls. Source lives on GitHub; no pricing or stated license.",
      },
      {
        title: "Pretext Demos",
        href: "https://chenglou.me/pretext/",
        dateAdded: "2026-07-20",
        description:
          "Nine live demos for Pretext, Cheng Lou's zero-dependency TypeScript text layout library that measures and wraps multiline text in pure arithmetic instead of DOM reads, skipping the reflow that getBoundingClientRect and offsetHeight force. The demos cover the layouts that measurement usually blocks: accordions and message bubbles sized before paint, editorial text routed around obstacles, CSS versus greedy versus Knuth-Plass justification side by side, masonry grids, virtualized markdown chat and particle-driven ASCII art in proportional glyphs. By the author of react-motion and ReScript, formerly on the React core team.",
      },
      {
        title: "ASCII Waves (DS01 Interface Lab)",
        href: "https://myuiweb.vercel.app/asciiwaves",
        dateAdded: "2026-07-19",
        description:
          "Interactive ASCII wave effect from the DS01 Interface Lab component collection: a WebGL fluid surface with mathematical displacement mapping that swells and ripples as reactive air under the cursor. Ships live controls for swell speed, wave frequency, fluid radius and repel force, so you can tune the feel before lifting the technique.",
      },
      {
        title: "Super Hover",
        href: "https://super-hover.danielpetho.com/",
        dateAdded: "2026-07-19",
        description:
          "A super tiny library by Daniel Petho that hit-tests hover every frame. Unlike native :hover, it keeps tracking whatever sits under your pointer while you scroll or when things move on screen: each frame it calls elementFromPoint against [data-super-hover] targets, toggles a data-super-hover-active attribute, and fires superhoverenter/leave/move events, with a useSuperHoverRef React hook and an optional swept hit test so fast pointer moves never skip elements.",
      },
      {
        title: "Line nav (chanhdai)",
        href: "https://chanhdai.com/components/line-nav",
        dateAdded: "2026-07-14",
        description:
          "Animated underline nav bar component from chanhdai's component collection, where the underline slides and morphs between tabs. Built by @iamncdai under MIT license; install directly via `pnpm dlx shadcn add @ncdai/line-nav`, with animation powered by Framer Motion's motion/react.",
      },
      {
        title: "Coverflow",
        href: "https://coverflow.ashishgogula.in",
        dateAdded: "2026-07-14",
        description:
          "Recreation of Apple's classic Coverflow browsing interaction in CSS and JS, a reference for building similar carousel-style pickers. Uses real-time, interruptible spring physics instead of fixed-timeline tweens, plus synthesized spatial audio on flicks, built by Ashish Gogula.",
      },
      {
        title: "Goey Toast",
        href: "https://goey-toast.vercel.app",
        dateAdded: "2026-07-14",
        description:
          "Squishy, gooey toast notification component with a blob-like morph animation instead of a plain slide-in. The squish comes from an SVG goo filter (blur plus contrast matrix) merging toast shapes mid-transition, the classic CSS gooey-effect technique.",
      },
      {
        title: "React Table Craft",
        href: "https://react-table-craft.vercel.app",
        dateAdded: "2026-07-14",
        description:
          "Drag-and-drop table builder for React, for visually assembling a data table instead of hand-coding columns and rows. By Ahmed Elkhdrawy: virtualizes 100k+ rows, keeps its logic layer headless and decoupled from UI, and ships under 8KB gzipped.",
      },
      {
        title: "Ali Imam blocks",
        href: "https://aliimam.in/blocks",
        dateAdded: "2026-07-14",
        description:
          "Collection of copy-paste Tailwind CSS UI blocks for quickly assembling common page sections. Built by Ali Imam, a 21st.dev ambassador and shadcn/ui Registry contributor who has shipped over 1,000 projects.",
      },
      {
        title: "itshover",
        href: "https://www.itshover.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source library of animated React icon components built to work with Next.js, described as 'icons that move with intent', browsable and customizable, with community contributions. Created by Abhijit (@abhijitwt) and backed by Vercel's open-source program, with icons installable straight into shadcn-based projects.",
      },
      {
        title: "Button (lakshb)",
        href: "https://button.lakshb.dev",
        dateAdded: "2026-07-14",
        description:
          "Collection of animated button styles and micro-interactions to copy into a project. Made by Lakshay Bhushan (@blakssh), it ships 6 metal-finish variants (Gold, Bronze, Success, Error, Primary, Default) with live v0.dev previews.",
      },
      {
        title: "Cult UI: dynamic island",
        href: "https://www.cult-ui.com/docs/components/dynamic-island",
        dateAdded: "2026-07-14",
        description:
          "Recreation of iOS's Dynamic Island as a React component, for pill-shaped expanding notification UI on the web. From nolly-studio's cult-ui (5.8k GitHub stars), it ships 13 built-in size presets and a one-line shadcn CLI install.",
      },
      {
        title: "Codepen: simeydotme",
        href: "https://codepen.io/simeydotme/pen/myVddQ0",
        dateAdded: "2026-07-14",
        description:
          "CodePen demo by simeydotme, a well-known CSS/SVG animator, showing a creative UI interaction technique. By the same simeydotme who created the viral CSS holographic Pokemon-card effect that spun off into the pokemon-cards-css library.",
      },
      {
        title: "Cult UI: family button",
        href: "https://www.cult-ui.com/docs/components/family-button",
        dateAdded: "2026-07-14",
        description:
          "Expanding action button group component from Cult UI, a single button that fans out into related actions. Built by Cult UI (5.8k GitHub stars) and installed via the shadcn CLI, its expansion animation is explicitly modeled on Apple's Family Sharing app icon.",
      },
      {
        title: "Cult UI: mock browser window",
        href: "https://www.cult-ui.com/docs/components/mock-browser-window",
        dateAdded: "2026-07-14",
        description:
          "Fake browser chrome component from Cult UI for framing screenshots and demos inside a realistic browser window. Supports chrome, safari, and generic browser skins, plus a sidebar that can be docked to any of the four edges with adjustable texture-overlay opacity.",
      },
      {
        title: "Codepen: jh3y",
        href: "https://codepen.io/jh3y/pen/QwyYoVr",
        dateAdded: "2026-07-14",
        description:
          "CodePen demo by jh3y, a prolific CSS animator known for physics-driven and generative interaction experiments. True to jh3y's signature style, this pen sculpts the effect from a single HTML element using layered CSS rather than JavaScript or a canvas library.",
      },
      {
        title: "buttonyui",
        href: "https://buttonyui.com",
        dateAdded: "2026-07-14",
        description:
          "Library of animated button components ready to copy into a project. Ships as one scrollable page of live, copy-paste buttons: no npm install, no framework picker, just markup and CSS you lift directly from the demo.",
      },
      {
        title: "Wigggle UI widgets",
        href: "https://wigggle-ui.vercel.app/widgets",
        dateAdded: "2026-07-14",
        description:
          "Wobbly, spring-physics widget component kit with a deliberately playful, jiggly feel. Built solo by Henil Shah, the catalog spans 82 widgets across 8 categories (calendar, clock, weather, stocks), with a 22-piece calendar set added most recently.",
      },
      {
        title: "Typed.js demo",
        href: "https://mattboldt.com/demos/typed-js",
        dateAdded: "2026-07-14",
        description:
          "Live demo of Typed.js, the long-running classic library for typewriter-style text animation on the web. Built by Matt Boldt; installable via npm, Yarn, or Bower, and Boldt sells paid commercial licenses for closed-source projects.",
      },
      {
        title: "SpoilerJS",
        href: "https://spoilerjs.sh4jid.me",
        dateAdded: "2026-07-14",
        description:
          "Discord-style spoiler text component that blurs text until clicked or hovered to reveal it. Ships as a dependency-free Web Component (works in React, Vue, Svelte, or vanilla JS) with tunable particle density, velocity, and reveal-duration props.",
      },
      {
        title: "shadcnexamples: authentication",
        href: "https://shadcnexamples.com/authentication",
        dateAdded: "2026-07-14",
        description:
          "Full, ready-to-copy shadcn/ui authentication page example, not just an isolated form component. Bundles login, registration, password reset, and email verification pages together, but the source is gated behind a $79-129 one-time paywall.",
      },
      {
        title: "21st.dev: location tag",
        href: "https://21st.dev/community/components/jatin-yadav05/location-tag/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted location tag component on 21st.dev, a small pill-style UI element for showing a place name. By Jatin Yadav (published Dec 2025), it takes city/country/timezone props and swaps text to show the live local time on hover.",
      },
      {
        title: "21st.dev: 3D folder",
        href: "https://21st.dev/community/components/jatin-yadav05/3d-folder/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted 3D folder hover component on 21st.dev, a folder icon that opens with a 3D tilt on hover. Also by Jatin Yadav, its AnimatedFolder component takes a title and a projects array and depends on lucide-react for icons.",
      },
      {
        title: "21st.dev: AI chat",
        href: "https://21st.dev/community/components/s/ai-chat",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted AI chat interface component on 21st.dev, a ready-made message thread UI for chatbot products. This entry sits inside 21st.dev's broader 78-component AI chat collection (part of a 116-component suite), installable via shadcn CLI or Magic MCP.",
      },
      {
        title: "kokonutui: AI voice",
        href: "https://kokonutui.com/docs/components/ai-voice",
        dateAdded: "2026-07-14",
        description:
          "Voice AI waveform component from kokonutui's component library, for visualizing live audio input or playback in a voice assistant UI. Built with Motion (Framer Motion) and Tailwind CSS v4, it installs via `bunx shadcn@latest add @kokonutui/ai-voice`, alongside kokonutui's AI Input Selector and State Loading.",
      },
      {
        title: "21st.dev: agenticfleet",
        href: "https://21st.dev/community/agenticfleet",
        dateAdded: "2026-07-14",
        description:
          "Community components on 21st.dev built for AI agent fleet dashboards, monitoring multiple running agents at once. The URL points to a 21st.dev user profile (username agenticfleet) rather than a themed collection, and currently 404s as 'User not found.'",
      },
      {
        title: "shadcnexamples: blog detail page",
        href: "https://shadcnexamples.com/blog-detail-page",
        dateAdded: "2026-07-14",
        description:
          "Full, ready-to-copy shadcn/ui blog post detail page example. Beyond the post body, this template bundles an author-bio block, category tags, and a related-posts section, per shadcnexamples' own listed feature set.",
      },
      {
        title: "21st.dev: moon chat",
        href: "https://21st.dev/community/components/ruixenui/ruixen-moon-chat/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted AI chat widget on 21st.dev with a moon-themed visual style. Built by Ruixen UI (@ruixen.ui) using lucide-react icons, it ships preset Quick Action prompts like 'Generate Code' and 'Launch App' for coding-assistant use cases.",
      },
      {
        title: "Skiper UI: skiper87",
        href: "https://skiper-ui.com/v1/skiper87",
        dateAdded: "2026-07-14",
        description:
          "Drag-and-scroll interaction component from Skiper UI's numbered component series. Built on shadcn/ui's ScrollArea and credited to Gustav Ekerot and jh3yy, it fades scroll edges via pure CSS mask-image, no JavaScript required.",
      },
      {
        title: "21st.dev: blog cards",
        href: "https://21st.dev/community/components/sumonadotwork/blog-cards/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted blog card component on 21st.dev for displaying post previews in a grid. Made by Sumona Biswas, inspired by Nazhamid's journal design, using dashed separators for an editorial, text-first reading feel.",
      },
      {
        title: "21st.dev: reading text reveal",
        href: "https://21st.dev/community/components/wisedev/reading-text-reveal/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted scroll-triggered text reveal component on 21st.dev, text that fades or highlights in as you scroll past it. Built by waleedkibhen (vvisedev Crafts), it highlights text word-by-word as you scroll past it rather than revealing whole lines at once.",
      },
      {
        title: "21st.dev: retro button",
        href: "https://21st.dev/serafimcloud/button-retro/default",
        dateAdded: "2026-07-14",
        description:
          "Community-submitted retro-styled button component on 21st.dev with a chunky, skeuomorphic look. By Serafim (serafimcloud), it ships 5 built-in color variants, default, darkGray, white, lightGray, gray, styled via class-variance-authority.",
      },
      {
        title: "Magic UI: highlighter",
        href: "https://magicui.design/docs/components/highlighter",
        dateAdded: "2026-07-14",
        description:
          "Animated text highlighter component from Magic UI that draws a marker-style highlight stroke behind text on scroll or load. Built by contributor Pratiyank, it exposes 7 annotation styles including bracket and crossed-off, with an iterations prop for a sketchier hand-drawn look.",
      },
      {
        title: "devl.dev",
        href: "https://www.devl.dev",
        dateAdded: "2026-07-14",
        description:
          "Collection of 158 production-ready UI experiments built with React, Tailwind and Base UI, spanning layouts, forms, dashboards, tables and charts, meant to be copied and adapted directly. Built by Sean (of Cal.com) on his own coss-ui library, organized into 18 folders with cmd+K keyboard navigation between experiments.",
      },
      {
        title: "JustGage",
        href: "https://toorshia.github.io/justgage",
        dateAdded: "2026-07-14",
        description:
          "Lightweight JavaScript library for drawing animated gauge and dial charts with no dependencies beyond Raphael/SVG. Created by Bojan Djuricic (toorshia) and in active use since 2012, making it one of the longest-running gauge libraries still maintained today.",
      },
    ],
  },
  {
    title: "Interface design guidelines and craft",
    links: [
      {
        title: "Learn UI",
        href: "https://learn-ui.com/",
        dateAdded: "2026-09-02",
        kind: "course",
        useFor: [
          "design engineering",
          "interactive ui book",
          "motion guidelines",
          "spring animation",
          "gesture design",
          "component craft",
          "train design taste",
          "explorable ui",
        ],
        description:
          "Interactive book about design engineering: how interfaces are built to feel right, from motion and typography to systems, craft and taste. Chapters pair prose with operable figures, including a spring playground, swipe commitment, stacked toasts, drawers, command menus, focus-respecting modals and dark mode without the flash. The book reads from practitioners including Rauno Freiberg, Emil Kowalski, Maggie Appleton, Bartosz Ciechanowski, Kathryn Gonzalez, Jim Nielsen, Paco Coursey, Steve Ruiz, Amelia Wattenberger and Andrew Swank, with claims traced to sources and a glossary that quotes authors verbatim.",
      },
      {
        title: "Refero Styles",
        href: "https://styles.refero.design/",
        dateAdded: "2026-08-12",
        kind: "directory",
        stack: [
          "design",
          "ai",
          "llm",
          "mcp",
          "design-systems",
          "design-tokens",
        ],
        useFor: [
          "design.md",
          "design md",
          "design system for ai",
          "ai readable design system",
          "make it look like linear",
          "design tokens from a site",
          "extract a design system",
          "agent design taste",
          "design system examples",
        ],
        description:
          "Catalogue of design systems pulled off real product sites and published as a DESIGN.md you can hand to a coding agent before it builds a UI. Each entry breaks a site into colors, typography, spacing and components, with the file pitched for Cursor, Claude Code, Codex, v0 and Lovable, and the header claims 2,000-plus systems, sorted by Trending, Popular or Newest across three sub-sections (DESIGN.md examples, AI design resources, Design prompts). Entries carry a one-line aesthetic read next to the tokens: Linear as a midnight precision instrument, Mercury as Alpine banking at blue hour, Factory as a terminal war room at midnight, alongside Anthropic, ElevenLabs, Wispr Flow, Slush and Monad. Run by Refero, the same team as the refero.design screen reference site and its MCP server; the page is marked Beta, shows no pricing, and never says who authors the files or whether the companies listed are involved, so treat the extraction as unofficial.",
      },
      {
        title: "Product Design Psychology",
        href: "https://productdesignpsychology.com/",
        dateAdded: "2026-07-27",
        description:
          "Free online book on the psychology running underneath product design: how users actually perceive and decide, and how your own reasoning and your organization distort what finally ships. Forty chapters by Wouter de Bres across four sections: The Designer's Mind, Minding the Design, The User's Mind and The Organization's Mind. Chapter titles like 'Intuitive Design Is a Lie', 'Users React, Then Rationalize' and 'Good Design Dies in Meetings' aim at the failure modes that survive a design review. Published free on the web in May 2026, read in the browser with no signup.",
      },
      {
        title: "Laws of UX",
        href: "https://lawsofux.com",
        dateAdded: "2026-07-25",
        description:
          "Collection of 31 psychology and usability principles that explain why an interface works, each on its own page with a definition, its origins and takeaways you can act on. Built by designer Jon Yablonski, covering Fitts's Law, Hick's Law, Jakob's Law, the Doherty Threshold, Miller's Law, Tesler's Law, the Von Restorff Effect, the Zeigarnik Effect and the rest. There is a companion book and a large-format index poster in the shop; site content is CC BY-NC-ND 4.0, so cite it rather than repackaging it.",
      },
      {
        title: "How to make your app look and feel 10x better",
        href: "https://x.com/heysatya_/status/2078444307418345639",
        dateAdded: "2026-07-19",
        description:
          "Satya's mobile app design cheatsheet: a copy-and-apply list of small, concrete moves (spacing, hierarchy, motion, tap feedback, empty states) that take a mobile UI from functional to polished. Aimed at app builders who want fast, tactical wins rather than theory.",
      },
      {
        title: "userinterface.wiki",
        href: "https://www.userinterface.wiki/",
        dateAdded: "2026-07-14",
        description:
          "Reference wiki of UI/UX best practices organized by category (animation, typography, forms, accessibility and more), with concrete do's and don'ts rather than abstract principles. Maintained by Raphael Salaja, also the creator of Calligraph, a fluid text-morphing library for React, on GitHub as raphaelsalaja/userinterface-wiki.",
      },
      {
        title: "Vercel Web Interface Guidelines",
        href: "https://vercel.com/design/guidelines",
        dateAdded: "2026-07-14",
        description:
          "Vercel's own published guidelines for building web interfaces: interaction, accessibility, performance and design details their product teams hold themselves to. Roughly 110 individual recommendations across 6 sections, installable as a project AGENTS.md via curl and wired into Claude Code, Cursor, and Windsurf.",
      },
      {
        title: "Components Build principles",
        href: "https://www.components.build/principles",
        dateAdded: "2026-07-14",
        description:
          "Foundational principles for building modern UI components: favor composition over inheritance, and make components accessible, customizable, performant and transparent by default. Names six principles explicitly, including a copy-and-paste distribution model that favors source-level code ownership over black-box package dependencies.",
      },
      {
        title: "System button",
        href: "https://devouringdetails.com/system/button",
        dateAdded: "2026-07-14",
        description:
          "Deep documentation of a single Button component's design system: variant/color/size props decoupled from appearance, smooth loading transitions, Safari force-press detection, and the reasoning behind its disabled and loading states. Uses Safari's non-standard webkitmouseforcedown event to detect force-press trackpad input and scale the button from 0.97 down to 0.94.",
      },
      {
        title: "LINE Design System",
        href: "https://designsystem.line.me/",
        dateAdded: "2026-07-14",
        description:
          "LINE's official design system: the visual and interaction standards used to keep its products consistent across a huge, multi-team surface area. Spans LINE's whole product family (messaging, LINE Pay, LINE Manga, and more) across iOS, Android, and web with shared tokens and components.",
      },
      {
        title: "Impeccable",
        href: "https://impeccable.style/#downloads",
        dateAdded: "2026-07-14",
        description:
          "Design system and style resource focused on precise, considered visual details, downloadable assets for building interfaces with the same level of polish. Built by Paul Bakaus; installs via `npx impeccable install` and ships a 46-rule deterministic slop detector plus a Claude Code plugin.",
      },
      {
        title: "Hit area",
        href: "https://bazza.dev/craft/2026/hit-area",
        dateAdded: "2026-07-14",
        description:
          "Introduces a small set of Tailwind utility classes (installable via the shadcn registry) for expanding an element's clickable area beyond its visual bounds, with patterns for checkboxes in tables and sidebar nav items. By Kian Bazza (March 2026); installs with `npx shadcn@latest add https://bazza.dev/r/hit-area` and ships a hit-area-debug class to visualize the expanded zones.",
      },
      {
        title: "Designing Depth",
        href: "https://rauno.me/craft/depth",
        dateAdded: "2026-07-14",
        description:
          'Rauno Freiberg\'s essay on using shadow, blur and layering to create a real sense of depth in interfaces, rather than flat drop-shadows applied uniformly. Coins the term "dirtying the frame" for layered foreground compositing, and states outright that no AI was used to write the essay.',
      },
      {
        title: "New Interfaces",
        href: "https://www.interfaces.new/",
        dateAdded: "2026-07-14",
        description:
          "Platform and event series showcasing experimental digital interfaces and creative coding projects from independent artists and designers. Past showcases featured projects like Grant Kot's space generator and Quinn's print obscura, with a public calendar for upcoming livetweeted events.",
      },
      {
        title: "Industrial Empathy",
        href: "https://www.industrialempathy.com/",
        dateAdded: "2026-07-14",
        description:
          "Marc Hedlund's widely cited essay collection on internal tools, engineering management and building software people actually want to use, including the well-known 'build internal tools for adoption, not mandate' piece. Hedlund was VP of Engineering at Stripe and Etsy and co-founded Wesabe, giving his management essays rare hands-on scale-up credibility.",
      },
      {
        title: "Notch case study",
        href: "https://iamnoman.com/notch",
        dateAdded: "2026-07-14",
        description:
          "Case study on refining a pixel-gradient tool's UI: working with Claude to go from a functional prototype to a polished interface by focusing specifically on how the notch moves, spring physics and transitions over instant state changes. The first working version took roughly a dozen prompts; most remaining effort went into overshoot timing and interrupt tolerance for the spring.",
      },
      {
        title: "Dot Matrix",
        href: "https://dotmatrix.zzzzshawn.cloud/",
        dateAdded: "2026-07-14",
        description:
          "Personal design/craft site by zzzzshawn exploring interface details and small interactive experiments. Ships 55+ MIT-licensed React loader components, each installable individually via `npx shadcn add`, maintained by @zzzzshawn on GitHub.",
      },
      {
        title: "Interfaces.dev",
        href: "https://interfaces.dev/",
        dateAdded: "2026-07-14",
        description:
          "Subscription design engineering magazine by Jakub Krehel, monthly issues with interactive demos and source code covering animation, typography and micro-interactions. Costs $7.99 a month (or $79.99 a year, 18% off) across roughly 14 issues, with three sample issues free to read.",
      },
      {
        title: "Make interfaces feel better",
        href: "https://jakub.kr/skills/make-interfaces-feel-better",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skill that applies craft principles (typography, hover states, shadows, micro-interactions) to polish a UI's details, installable via CLI, with feedback on what it changed. Built by Jakub Krehel, installed via `npx skills add jakubkrehel/make-interfaces-feel-better`; also works in Codex and Cursor Agent, not just Claude Code.",
      },
      {
        title: "Mockdown",
        href: "https://www.mockdown.design/",
        dateAdded: "2026-07-14",
        description:
          "Web-based tool for turning rough wireframes or sketches into structured design mockups. Runs as a keyboard-driven ASCII wireframe editor in the browser, letting you draw boxes, buttons, and tables as text on an 80x40 canvas.",
      },
      {
        title: "Unsung",
        href: "https://unsung.aresluna.org/",
        dateAdded: "2026-07-14",
        description:
          "Marcin Wichary's blog on software craft: essays on the small, easy-to-miss interface details, from keyboard shortcuts to typography to forgotten computing history, that shape how software actually feels to use. Wichary is the ex-Medium/Figma designer behind 'Shift Happens,' a two-volume, Kickstarter-funded book on the history of keyboards.",
      },
      {
        title: "TOLIS technical drawing",
        href: "https://tol.is/blueprint",
        dateAdded: "2026-07-14",
        description:
          "Series of technical-drawing-style illustrations from design studio TOLIS, blueprint-style diagrams as a visual reference for precise, engineered-looking graphics. A solo design engineer's project (item #23 of ~33 in TOLIS C's portfolio), not a studio, rooted in generative and computational-geometry work.",
      },
      {
        title: "Rams",
        href: "https://www.rams.ai/",
        dateAdded: "2026-07-14",
        description:
          "Automated design-review platform that scores every UI change in a pull request against 194 design-system and accessibility rules (color, typography, spacing, motion, components, UX, craft), giving a senior design review on every PR with inline fix suggestions. Founded by Cory Etzkorn (ex-Notion design engineer); its free Claude Code skill install alone has been installed 77,868+ times.",
      },
      {
        title: "10 principles for fluid UI",
        href: "https://karlkoch.me/writing/10-principles-for-fluid-ui",
        dateAdded: "2026-07-14",
        description:
          "Essay laying out ten concrete principles for building interfaces that feel fluid and responsive to touch and motion, not just visually animated. Written by Karl Koch, DuckDuckGo's inaugural Design Engineer, who argues for spring physics (stiffness, damping, mass) over time-based easing curves.",
      },
      {
        title: "Good Microcopy",
        href: "https://goodmicrocopy.com",
        dateAdded: "2026-07-14",
        description:
          "Collection of real, well-written UX copy examples from shipped products, organized by use case (empty states, errors, confirmations) for writers to reference. Runs as a Tumblr-format blog curated by Richard Sison since 2016, so it's browsable via infinite scroll or a tagged archive, not a static database.",
      },
      {
        title: "State of AI Design",
        href: "https://stateofaidesign.com",
        dateAdded: "2026-07-14",
        description:
          "Annual report surveying how AI tools are changing design workflows, roles and output, with data from working designers. The 2026 edition, from Designer Fund and Foundation Capital, surveyed over 900 designers across 60+ countries.",
      },
      {
        title: "The UX of AI",
        href: "https://www.shapeof.ai",
        dateAdded: "2026-07-14",
        description:
          "Reference library of interaction patterns and case studies specifically for designing AI product features, from chat to agentic flows. Built solo by designer Emily Campbell, it sorts roughly 57 patterns into six categories from Wayfinders to Identifiers.",
      },
      {
        title: "UI Guideline components",
        href: "https://www.uiguideline.com/components",
        dateAdded: "2026-07-14",
        description:
          "Database compiling best practices from the top 20 design systems and UI libraries into one component-by-component reference, from buttons to data tables, with Figma kits included. Already covers 45+ components pulled from those 20 systems, with new ones added weekly and Figma kits ready to drop in.",
      },
      {
        title: "Design Beyond Barriers",
        href: "https://designbeyondbarriers.com",
        dateAdded: "2026-07-14",
        description:
          "Accessibility guide written by designers for designers: 30 articles covering typography, color, form design and testing, arguing accessibility is a design decision, not just a developer checklist. Written by design studio Anton & Irene (dev by Astroshock); these 30 free articles precede a full book from Quarto publishing August 2026.",
      },
      {
        title: "Stack and Justify",
        href: "https://max-esnee.com/stack-and-justify",
        dateAdded: "2026-07-14",
        description:
          "Interactive cheatsheet for CSS flexbox stacking and justification, showing how justify-content and align-items combinations actually lay elements out. Built as a single-purpose microsite pairing each flex value combination with a live rendered box grid, faster to scan than MDN's static diagrams.",
      },
      {
        title: "The Good Line Height",
        href: "https://thegoodlineheight.com",
        dateAdded: "2026-07-14",
        description:
          "Short interactive guide to picking a good line-height value for body text, showing the readability difference live. Made by designer Fran Pérez; uniquely lets you dial in grid row height alongside font size, then hands you a companion Figma plugin.",
      },
    ],
  },
  {
    title: "Design inspiration galleries",
    links: [
      {
        title: "Nicefolios",
        href: "https://nicefolios.com/",
        dateAdded: "2026-09-01",
        kind: "gallery",
        useFor: [
          "portfolio inspiration",
          "portfolio websites",
          "portfolio gallery",
          "browse portfolios",
          "portfolio directory",
          "rebuilding my portfolio",
        ],
        description:
          "Archive of portfolio websites curated by Maze Heart (@remvze), for visual reference when you are rebuilding your own site. 37 entries on the index, toggled between All, Individuals, Collectives and Random, each one dated in its URL so you can see when it was added, spanning 2025 through August 2026. Named picks include darkroom.engineering, Murmure, Anton Repponen, MONOLOG, Otherkind, Studio Almond, Garbett and Redis Agency, split between solo designers and studios. No pricing, membership or submission form on the index; sponsors listed are Interfaces, Resurf, React Bits Pro, Details and Indent.",
      },
      {
        title: "Saaspo",
        href: "https://saaspo.com/",
        dateAdded: "2026-08-31",
        kind: "gallery",
        useFor: [
          "saas website examples",
          "saas landing page",
          "landing page examples",
          "pricing page examples",
          "pricing section examples",
          "saas marketing site",
          "hero section examples",
          "about page examples",
          "feature section design",
        ],
        description:
          "Gallery of SaaS marketing sites indexed on two axes, whole pages and individual sections, so you can study a complete pricing page or just the pricing band lifted out of hundreds of them. Page types run landing, pricing, product and about; section types cover pricing, features, integrations and heroes, alongside OG image and asset collections. The pricing libraries show the split: 496 full pricing pages against 62 pricing sections. Free with no paid tier, built by its founder as a first no-code project and grown from around 300 pages to over 1,400, with new sites hand-picked almost daily from X, Product Hunt, BetaList and reader submissions, plus a weekly newsletter and affiliate links on some outbound clicks.",
      },
      {
        title: "Tools I keep coming back to",
        href: "https://www.rachelhow.com/tools",
        dateAdded: "2026-08-29",
        kind: "directory",
        useFor: [
          "design reference sites",
          "where designers look",
          "design bookmarks",
          "visual archive",
          "type and icon references",
          "curated design tools",
          "old ads and annual reports",
        ],
        description:
          "Flat list of 11 references a working product designer keeps returning to: Mobbin, ShaderGradient, recent.design, Cosmos, Macfolio, Fonts In Use, Design Spells, Icon Museum, Annual Report Archive, Study Old Ads and fuse.kiwi. Rachel How is a senior product designer and YouTuber with 280k+ subscribers, and Video Lead at Mobbin, worth knowing because Mobbin heads the list carrying a 20% off Pro offer and every outbound link appends a ref=rachelhow.com parameter. The weighting is the useful part: visual archives rather than software, running from type specimens and icon collections to annual reports, vintage advertising and a catalogue of small delightful interactions. Set expectations before clicking through, since the page gives no descriptions at all, only a name, a thumbnail on seven of the eleven, and an open link, so it is a jumping-off point rather than a reference in itself.",
      },
      {
        title: "GatherOS",
        href: "https://gatheros.co/",
        dateAdded: "2026-08-19",
        kind: "tool",
        stack: ["macos"],
        useFor: [
          "save design references",
          "organize inspiration",
          "reference library",
          "moodboard app",
          "screenshot library",
          "search by color",
        ],
        description:
          "Native Mac app for collecting design references without leaving the desktop, local-first, with a Chrome extension for browser capture. Saves arrive by drag, paste, screenshot, extension, or by syncing X bookmarks, then sort into a Library, Collections and Spaces hierarchy alongside system views for bookmarks, unsorted and trash. Auto-tagging, AI visual search, search by color, a rediscover mode for surfacing old saves, and variation generation. No maker, team or pricing is named on the landing page.",
      },
      {
        title: "SEESAW",
        href: "https://www.seesaw.website/",
        dateAdded: "2026-08-18",
        kind: "gallery",
        useFor: [
          "web design inspiration",
          "site gallery by category",
          "saas website examples",
          "search sites by font",
          "developer tools websites",
        ],
        description:
          "Hand-picked directory of websites updated daily, with a command-K search that covers sites, fonts and categories, which makes it faster than most galleries when you want every site setting a particular typeface. Categories run Agency, AI, Crypto, Design, Design Tools, Developer Tools, E-Commerce, Fintech, Hardware, Marketing, Portfolios, Productivity and Social, and each entry gets its own page with a one-line description. Listings include Linear, Stripe, Raycast, Cursor, Ghostty and Cosmos. Free, with a newsletter, an open submission form and a sponsor slot; no team is named on the site.",
      },
      {
        title: "OGFolio",
        href: "https://www.ogfolio.com/",
        dateAdded: "2026-08-18",
        kind: "gallery",
        useFor: [
          "og image inspiration",
          "open graph image",
          "social share image",
          "twitter card design",
          "og image checker",
        ],
        description:
          "Gallery of Open Graph images, the picture that renders when someone shares a link, collected from 897 products so you can survey how other teams treat the format before designing your own. Entries pair the product favicon with its name (Neon, Mobbin, mymind, Hugeicons, BoltAI, Dynamic Mockups) and link through to a Toolfolio profile; the site is run by Toolfolio. It also carries an OG Image Analyzer: paste a URL and it checks dimensions, file size and meta tags.",
      },
      {
        title: "SiteInspire",
        href: "https://www.siteinspire.com/",
        dateAdded: "2026-08-18",
        kind: "gallery",
        useFor: [
          "web design gallery",
          "agency site inspiration",
          "portfolio site inspiration",
          "typographic websites",
          "minimal websites",
          "grid layout sites",
        ],
        description:
          "Long-running showcase of web design that credits the designers and agencies behind each entry, filterable by style, type, subject and platform and sortable by what is popular today, this week, this month or this year. The category counts show the scale: 2,355 agencies and consultancies, 2,088 typographic, 1,905 design and art direction, 1,392 portfolio, 896 web and interactive, 873 e-commerce, 747 minimal and 653 each for grid layout and unusual layout. Free to browse with a weekly email edit; sign-in is needed to save listings, and sponsored placements are part of the model.",
      },
      {
        title: "Minimal Gallery",
        href: "https://minimal.gallery/",
        dateAdded: "2026-08-12",
        kind: "gallery",
        style: ["minimal", "editorial"],
        useFor: [
          "minimal website design",
          "website design inspiration",
          "portfolio site inspiration",
          "agency website inspiration",
          "clean website examples",
          "personal site inspiration",
          "full site screenshots",
        ],
        description:
          "Curated gallery of restrained website design, running since 2013, for when you want full-site visual reference rather than cropped UI shots. Founded by a designer credited only as Piet, hand-picked, and deep: pagination runs to 129 pages at roughly 22 entries each, and the tag index puts Portfolio at 970 sites, Personal at 791 and Agency at 749, thinning through E-commerce (139), One page (122), Pricing (96) and Type foundry (24) down to single-entry tags like Wedding and Manufacturing. Alongside the Websites feed sit Templates and Tools sections, a bookmarking system with collections, and a weekly email digest, with outbound links carrying a ref parameter. Submission and sponsorship pages both exist, neither lists a price, and sponsored slots run inline in the feed with a label.",
      },
      {
        title: "The Internet Designs",
        href: "https://www.theinternetdesigns.com/",
        dateAdded: "2026-08-12",
        kind: "gallery",
        useFor: [
          "ui inspiration gallery",
          "brand design inspiration",
          "dashboard design inspiration",
          "mobile app ui inspiration",
          "logo design inspiration",
          "interaction design examples",
          "design posts from x",
        ],
        description:
          "Design inspiration gallery whose feed is pulled from posts on X and Pinterest, for a fast scan of interface work people are shipping right now rather than full-site screenshots or code. Eleven filters cover Interfaces, Landing page, Mobile apps, Dashboards, Interactions, Product, Typography, 3D, Brand design, Logo design and Illustration, with a Recently view, and each card is an avif poster or thumbnail carrying the original post text, so the author's handle and links back to the source come along with the image. Around 24 posts were live in August 2026, animation included: a squircle button built on the CSS corner-shape property, a recreation of the Mac OS X genie effect, Wealthsimple's aurora background rebuilt in Skia, and a macOS 27 beta app icon update. There is no about page, submission form, pricing or newsletter, and the only maker signal on the page is a link to the project's GitHub repo.",
      },
      {
        title: "Inspora",
        href: "https://www.inspora.design/",
        dateAdded: "2026-08-08",
        kind: "gallery",
        useFor: [
          "curated design archive",
          "visual design inspiration",
          "recent design work",
          "design work from x",
          "creative work archive",
          "print design inspiration",
          "designers to follow",
        ],
        description:
          "Curated archive of recent visual design and creative work, worth browsing when you want a fast scan of what designers are shipping right now across disciplines rather than full-site screenshots. Posts filter across seven categories (Web, Branding, Product, Motion, Illustration, 3D, Print) with a Latest and Featured toggle, and each entry is one image plus a title, the creator's X handle, and a View original link back to their post. Around 24 items were live in August 2026, and post slugs run in numbered batches of nine, though those batches are not labeled anywhere in the interface. There is no about page, submission form, or maker credit, and the only subscription option is a weekly email.",
      },
      {
        title: "Headers Club",
        href: "https://www.headers.club/",
        dateAdded: "2026-08-07",
        kind: "gallery",
        useFor: [
          "website header design",
          "header design gallery",
          "hero header inspiration",
          "landing page headers",
          "website headers",
          "header images",
          "top of page design",
        ],
        description:
          "Curated gallery of website header designs, useful when you want visual reference for heroes and top-of-page treatments rather than full-site screenshots. Meta and third-party listings describe it as browsing the hottest header images on the internet, with a share prompt for headers that are too hot to handle, and older write-ups called out daily updates. As of August 2026 the live site is a holding page that says a new version is incoming, with only the tagline and 2026 copyright visible, so the archive itself is offline while the rebuild is in progress.",
      },
      {
        title: "Macapp Supply",
        href: "https://macapp.supply",
        dateAdded: "2026-08-06",
        kind: "directory",
        stack: ["macos"],
        useFor: [
          "mac app design",
          "macos app inspiration",
          "native app ui reference",
          "desktop app design",
          "beautiful mac apps",
          "app icon inspiration",
          "find a mac app",
        ],
        description:
          "Manually curated shelf of macOS apps picked for design quality, worth browsing when you want to see how native Mac software is being styled right now rather than find the most popular tool for a job. Roughly 35 apps sit in the main grid across 16 categories (AI, Analytics, Audio, Business, Communication, Design, Dev, Entertainment, Finance, Lifestyle, Marketing, Photography, Productivity, Utility, Video, Writing), sorted by Hot or Latest, with a separate icons section, a Supply Pick editorial badge, an RSS feed and an open submission flow. Curated by Solt Wagner, who also ships Supaste and Cooldock. Some outgoing links are affiliate links, no total app count is published, and the site is not affiliated with Apple.",
      },
      {
        title: "movin.design",
        href: "https://movin.design/",
        dateAdded: "2026-08-06",
        kind: "gallery",
        stack: ["motion"],
        style: "marketing-motion",
        useFor: [
          "motion design inspiration",
          "ui motion gallery",
          "web animation inspiration",
          "motion clips from x",
          "interface animation examples",
          "css easing gallery",
          "motion design feed",
        ],
        description:
          "Curated gallery of motion design clips pulled from X, for browsing product UI and marketing motion rather than static site screenshots. Meta claims daily updates; the home feed is video-first with save buttons, pagination (page 2+), and a CDN at cdn.movin.design, built on Astro 7. Beyond the feed it ships a CSS easing and cubic-bezier gallery at /easings/ and an icons section at /icons/. Homepage alone lists dozens of named clips (spritesheet characters, liquid-glass footers, carousels, onboarding, page transitions); count unique video slugs on the first page around 32, with more on later pages. Free to browse; the site runs Google Analytics and AdSense.",
      },
      {
        title: "save.design",
        href: "https://save.design/",
        dateAdded: "2026-08-05",
        kind: ["gallery", "tool"],
        useFor: [
          "save design inspiration",
          "website tech stack",
          "tech stack detection",
          "website design gallery",
          "analyze website stack",
          "curated website inspiration",
          "design inspiration mcp",
          "organize design bookmarks",
        ],
        description:
          "Personal design-inspiration library for whole sites, not just screenshots: browse a curated feed, save what you like, then re-open it with the stack attached (framework, animation libraries, fonts, CMS, hosting). The analyzer is the product hook, aimed at designers and devs, and it claims to catch modern front-end pieces such as Next.js, Astro, Framer Motion, GSAP, Three.js, Spline and Lenis rather than a pretty still alone. Explore filters by framework, animation library, category and industry; there is a dedicated /analyze paste flow, a Chrome extension (Save Design on the Web Store) for bulk-saving tabs, and a membership tier that unlocks a curated Elements feed, natural search and your own MCP endpoint. Free core use; paid plans on the pricing page start around $3 and $10 a month with a 7-day trial on the higher tier. X handle is @AISaveDesign.",
      },
      {
        title: "11x11",
        href: "https://networked.art/11x11",
        dateAdded: "2026-08-05",
        kind: ["demo", "gallery"],
        stack: ["ethereum"],
        useFor: [
          "11x11 pixel art",
          "collaborative pixel art",
          "participatory web art",
          "creative coding inspiration",
          "ethereum birthday artwork",
          "onchain art project",
          "pixel grid experience",
        ],
        description:
          "Participatory pixel-art project and public gallery made for Ethereum's eleventh birthday, useful as a reference for turning a tiny creative constraint into a shared web experience. Each visitor makes an image on an 11 by 11 grid with 11 colors, then shares a referral link that connects both canvases to one public network. Built by Ethlabs and networked.art with its participants, the live page reports 35,245 pieces made and 11,639 collected, with separate views for the timeline, network, groups and leaderboard.",
      },
      {
        title: "Abduzeedo",
        href: "https://abduzeedo.com/",
        dateAdded: "2026-08-05",
        kind: "gallery",
        useFor: [
          "branding inspiration",
          "visual identity inspiration",
          "graphic design inspiration",
          "typography inspiration",
          "packaging design",
          "editorial design",
          "design blog",
        ],
        description:
          "Long-running design inspiration blog, publishing since 2006 and still posting daily, weighted toward branding, visual identity, packaging, editorial and typography rather than web UI. Every post credits the studio or designer behind the work, so a single day's front page can run Pentagram's health branding for Rugiet next to a monospaced typeface specimen, a Middle Eastern street food packaging system and Landor Australia's Petbarn identity, with a Best of the Week roundup pulling the strongest together. Sections cover 3D, Books, Branding, Editorial Design, Graphic Design, Illustration, Tutorials, Typography, UI/UX and Collections, and there is a Get Featured route for submissions. The site has a Typography Laboratory behind the F key that reskins its own type as you read, swapping the site, heading and body faces between Mundial, Inter, Outfit, Bricolage, Libre Caslon, Playfair, Lora, Merriweather and EB Garamond, and adjusting measure. Ad supported.",
      },
      {
        title: "CSS Design Awards",
        href: "https://www.cssdesignawards.com/",
        dateAdded: "2026-08-05",
        kind: "gallery",
        useFor: [
          "web design awards",
          "award winning websites",
          "site of the day",
          "submit my site to awards",
          "agency website inspiration",
          "award gallery",
          "high craft websites",
        ],
        description:
          "Awards site running since 2009 that scores submitted websites on UI, UX and innovation and publishes the winners as a browsable wall, worth using when you want the heavily art directed end of studio and agency work. The tiers state their own thresholds: Website of the Day needs a panel average above 8.00, which moves with the quality of the pool, anything else averaging above 6 gets a Special Kudos certificate, and the public UI, UX and Innovation awards need more than 20 public votes alongside a judge average above 6. Monthly winners and selected daily winners feed into Website of the Year, while Designer of the Year splits by team size into Solo (one person plus a collaborator), Studio (two to ten) and Agency (ten and up), with Best In Class for runners up. Submission guidance asks for a quality screenshot and finished original work, and the site reserves the right to reject entries with errors or poorly executed design.",
      },
      {
        title: "Wall of Portfolios",
        href: "https://www.wallofportfolios.in/",
        dateAdded: "2026-08-05",
        kind: ["gallery", "directory"],
        useFor: [
          "designer portfolio gallery",
          "portfolio inspiration",
          "ux portfolio",
          "ux designer portfolios",
          "portfolio examples",
          "portfolio case studies",
          "dark themed portfolio",
        ],
        description:
          "Wall of designer portfolios covering UX, UI and product design, for when you are rebuilding your own and want to see how people in the same role structure a case study. Built by Praneeth Jonnala, it claims 30,000 designers and sorts by look, with 710+ minimal, 350+ dark themed, 280+ interactive, 170+ creative and 90+ modern layout, then filters by years of experience and by title from Product Design Intern up through Creative Director and Head of Design. Each month it names five Portfolios of the Month with a written rationale for each pick; the July 2026 set is Aanchal Maratha, Parul Aggarwal, Smriti Rawat, Raghav Dua and Mohd Bilal. It is India based and the featured designers come from that scene, and alongside the wall there are separate Case Studies and Job Tracker sections plus free submission, accounts and bookmarks.",
      },
      {
        title: "Footer",
        href: "https://www.footer.design/",
        dateAdded: "2026-08-04",
        useFor: [
          "footer design",
          "footer inspiration",
          "website footers",
          "footer layout",
          "site footer reference",
          "big footer",
          "footer navigation",
        ],
        description:
          "Gallery devoted entirely to website footers, for the strip of a page that usually gets designed last and looked at least. Run in their spare time by Benten Woodring, Devin Fountain and Matt Cram, who also work together at NOOON Studio; the logo is by Fons Mans. Entries are sorted by visual approach rather than industry: Typographic, Small Type, Large Type, Illustrative, Grid, Flat, Animated, Cards, Bright, Dark and Bold. The wall paginates to 63 pages, Editor's Choice picks include Yummygum, Turion Space and Marina Rachello, and each entry credits both the submitter and the designer.",
      },
      {
        title: "Bento Grids",
        href: "https://bentogrids.com/?category=ui",
        dateAdded: "2026-08-03",
        description:
          "Curated gallery of bento-grid layouts from shipped products and independent designers, with this link opening its UI-focused collection. Browse examples from Apple, Linear, Vercel, Attio, Raycast and many others, filter the wall by web design, graphic design or animation and by light or dark treatment, then follow each card back to its original source.",
      },
      {
        title: "Motionimo",
        href: "https://motionimo.xyz/",
        dateAdded: "2026-07-30",
        description:
          "Free gallery of motion design reference videos, for studying how commercials, product launches and explainers handle motion before shooting your own. Built and maintained since late 2022 by Mathis Fournier, a motion and web designer from Valence, France; submissions come from agencies, studios, freelancers and students and go through selective review before inclusion. Browsable by Inspirations and Studios, with a free account unlocking saving, notes and the full library plus a weekly newsletter of picks.",
      },
      {
        title: "404s",
        href: "https://www.404s.design/",
        dateAdded: "2026-07-29",
        description:
          "Curated gallery of creative 404 error pages, for the moment you have to design the one screen nobody plans for. Built by freelance designer Finnian Sturdy. Entries are tagged three ways: by style (brutalist, glitchy, editorial, hand-drawn, large type, retro, photographic and more), by interaction (animated, custom cursor, game, hover effects, scroll-driven), and by industry (agency, e-commerce, fintech, media, non-profit, personal, tech). Keyboard shortcuts G for grid and S for a random shuffle.",
      },
      {
        title: "Design Spells",
        href: "https://designspells.com/",
        dateAdded: "2026-07-25",
        description:
          "Catalog of micro-interactions, easter eggs and small design details pulled from shipped apps, for finding concrete prior art before building your own delightful moment. Started in May 2023 as a Twitter account by Chester, who works at Mobbin, and grew into a site plus a biweekly newsletter with over 5,500 subscribers. Entries are browsable by tag, so you can filter down to just desktop spells or just mobile ones.",
      },
      {
        title: "posts.design",
        href: "https://posts.design",
        dateAdded: "2026-07-25",
        description:
          "Reference wall of social post design, collecting announcement cards, product screenshots and launch graphics from real brands so you have something to look at before designing your own. Recent captures include Coca-Cola and Linear; entries note the post type and link back to the original. The maker is not named on the site.",
      },
      {
        title: "Minimum",
        href: "https://mnmm.xyz",
        dateAdded: "2026-07-25",
        description:
          "Directory of 148 minimal websites shown as a plain screenshot grid with a Random button and no filters, useful when you want restraint as a reference point rather than maximalism. Curated by Maze Heart (remvze), the same maker behind DSGNS, Headinger, OGPedia and Promptism, with entries dated from April 2025 through July 2026. Free, no submission process listed.",
      },
      {
        title: "Deck.gallery",
        href: "https://deck.gallery",
        dateAdded: "2026-07-25",
        description:
          "Gallery of 160 well-designed presentation decks, slides, keynotes and brand guideline documents, for studying how a strong deck is paced and laid out before building one. Featured decks come from Nike, Apple, Zapier, Discord, Formula 1, Strava, TikTok, Palantir, Disney and Adobe, tagged by type: Guidelines, Portfolio, Report, Sales, Pitch, Strategy, Marketing and Talks. Most are free to view, there is a weekly newsletter, and a small marketplace sells templates such as a $45 brand guidelines deck.",
      },
      {
        title: "The Component Gallery",
        href: "https://component.gallery/",
        dateAdded: "2026-07-24",
        description:
          "Reference catalog of how the world's design systems implement each interface component, for surveying real prior art before building your own version of a pattern. Created and maintained by developer and typography enthusiast Iain Bean as a long-running side project; it covers around 60 component types across 90-plus design systems (Fluent UI, Atlassian, Next UI, and more) with over 2,500 individual examples, each linking to the actual product implementation rather than a mockup. Pick a component such as carousel, tabs, accordion or color picker and see every system's take side by side.",
      },
      {
        title: "60fps",
        href: "https://60fps.design/",
        dateAdded: "2026-07-23",
        description:
          "Curated library of UI animation and interaction details captured from shipped iOS and web apps, for studying how real products handle motion. Holds 1,995 shots across 467 apps plus 77 app websites, 50 storyboards and 25 motion examples, filterable by 108 categories from tap and swipe up to spring physics, parallax, confetti and gyroscope. Recent captures include Duolingo's mega chest unlock and ChatGPT's long-press intelligence picker; there is also an MCP endpoint, an animation glossary and a mockup tool.",
      },
      {
        title: "Promptism",
        href: "https://promptism.xyz/",
        dateAdded: "2026-07-23",
        description:
          "Gallery of Midjourney prompts paired with their generated images, for studying how strong prompts are constructed before writing your own. Curated by Maze Heart (remvze), the same maker behind DSGNS, Headinger and OGPedia; each shot links to its own prompt page so you can read the exact wording that produced the image. Free.",
      },
      {
        title: "DSGNS",
        href: "https://dsgns.xyz/",
        dateAdded: "2026-07-23",
        description:
          "Visual gallery of design work pulled from X, for browsing what people are posting and jumping straight to the source thread. Curated by Maze Heart (remvze), every item links back to the original X post, so it doubles as a way to find the designers behind the work (featured handles include haris_chc, oliverhamrin, evilrabbit_, and dogukanui). Images are self-hosted on media.dsgns.xyz. Free.",
      },
      {
        title: "Headinger",
        href: "https://headinger.com/",
        dateAdded: "2026-07-20",
        description:
          'Searchable database of website headings and taglines, for when you are stuck writing the one line at the top of a landing page. Curated by Maze Heart (remvze), it holds 42 entries at the time of writing, each tagged (AI, Website, Data, Security) and marked H-One or H-Two so you can see whether it is the hero line or the section below it. Examples run to Vercel\'s "Build agents on infrastructure that thinks like them" and Polar\'s "Payment infrastructure for the 21st century". Free.',
      },
      {
        title: "OGPedia",
        href: "https://ogpedia.xyz/",
        dateAdded: "2026-07-20",
        description:
          "Gallery of Open Graph images collected from real sites, for designing the preview card your links show when shared. Curated by Maze Heart (remvze). It is a reference collection only, not a generator, so use it to decide layout, type scale and how much of the brand to show at thumbnail size. Free.",
      },
      {
        title: "Noiced Serendipity",
        href: "https://noiced.com/serendipity/",
        dateAdded: "2026-08-13",
        kind: "gallery",
        useFor: [
          "infinite canvas of websites",
          "random website inspiration",
          "browse sites randomly",
          "pan and zoom gallery",
          "website screenshot canvas",
          "stumble on good websites",
        ],
        description:
          "Randomized infinite canvas of website screenshots, for the case where you want to stumble into references instead of working down a paginated grid. It is a second browsing mode over the Noiced collection by Maze Heart (remvze), holding 73 sites dated December 2025 through July 2026, each one a distinct domain, shown as webp screenshots you pan around rather than scroll. The 37 tags behind it skew hard toward creative (37 sites), portfolio (36), minimal (25), marketing-website (19) and typographic (13), so it reads as a studio and personal-site survey more than a product-UI one. Built as a single Astro island called SerendipityCanvas, free, with no submission process listed.",
      },
      {
        title: "Noiced",
        href: "https://noiced.com/",
        dateAdded: "2026-07-20",
        description:
          "Daily web design inspiration: full-page screenshots of sites worth looking at, browsable by tag. Curated by Maze Heart (remvze), roughly four pages at 24 sites per page, and unusually heavy on pricing pages, which makes it a good place to survey how different products structure tiers. Entries range from AI products to museum sites. Free.",
      },
      {
        title: "Same Energy",
        href: "https://same.energy/",
        dateAdded: "2026-07-20",
        description:
          "Visual search engine that finds images matching the style and mood of one you give it, rather than the objects in it. Built by Jacob Jackson and launched in 2021, it runs on a CLIP-style deep learning model that works from pixels alone, so no tags or metadata are needed. Search by text, or drop and paste any image anywhere on the page to pivot the feed; results lean on CC-BY licensed images and right-click shows license and creator. Free, ad-free, with collections for saving boards of references.",
      },
      {
        title: "Collect UI",
        href: "https://collectui.com/",
        dateAdded: "2026-07-19",
        description:
          "Long-running gallery of daily UI shots and hand-picked interfaces, browsable by topic-based categories (login pages, dashboards, pricing, and many more), designer profiles, and a trending feed, with personal favorites collections. A quick way to survey many takes on one specific UI pattern at once.",
      },
      {
        title: "Details Inspo",
        href: "https://www.details.so/inspo",
        dateAdded: "2026-07-14",
        description:
          "Gallery focused specifically on small interface details (micro-interactions, transitions, edge cases) rather than whole-page layouts. Swiss-curated library of 3,000+ interactions letting you stack multiple tags (element + section + industry) at once for a narrower gallery than most inspiration sites.",
      },
      {
        title: "Inspo Page",
        href: "https://www.inspo.page/",
        dateAdded: "2026-07-14",
        description:
          "Browsable gallery of website design inspiration, screenshots of real sites organized for quick scanning. Now 301-redirects straight into Details.so's /inspo gallery, so it's effectively become the same 3,000+ item collection rather than a separate library.",
      },
      {
        title: "Design Engineer Tools",
        href: "https://designengineer.tools/",
        dateAdded: "2026-07-14",
        description:
          "Curated directory of tools specifically for the design engineer workflow, bridging design and frontend implementation. Curated solely by developer James Warner (jmswrnr.com), organized into 24 categories spanning Figma plugins, shader editors, and glTF tools.",
      },
      {
        title: "Toolfolio design tools",
        href: "https://toolfolio.com/design",
        dateAdded: "2026-07-18",
        description:
          "Browsable directory of design tools, with filters for platform, pricing and integrations alongside tool-specific collections and articles. Sits under a broader multi-category directory (marketing, dev, no-code tools), so the same filter set surfaces cross-domain picks beyond pure design tools.",
      },
      {
        title: "Search System",
        href: "https://searchsystem.co/",
        dateAdded: "2026-07-18",
        description:
          "A protected web reference retained for its search-focused experience and visual direction. Sits behind a hard 403 access wall rather than open browsing, likely why it's kept here as a private reference instead of a live link.",
      },
      {
        title: "Items Design",
        href: "https://items.design/",
        dateAdded: "2026-07-14",
        description:
          "Gallery of individual UI 'items' (components, patterns, micro-interactions) pulled from real products, for browsing at the piece level rather than full pages. Best used to pinpoint one micro-interaction, a specific toggle, dropdown, or empty state, in the wild once you already know the layout you're building.",
      },
      {
        title: "Landbook",
        href: "https://land-book.com/",
        dateAdded: "2026-07-14",
        description:
          "Long-running landing page inspiration gallery, searchable by industry, style and layout. Live since 2013, now indexing 5,000+ full sites plus 200,000+ categorized sections (heroes, pricing, footers) for zooming into just one part of a page.",
      },
      {
        title: "Recent Design",
        href: "https://recent.design/",
        dateAdded: "2026-07-14",
        description:
          "Feed of recently launched or redesigned websites, for seeing what's shipping right now rather than an evergreen archive. Sorts purely by launch timestamp rather than editorial pick, so the newest submission always sits at the very top of the feed.",
      },
      {
        title: "Dark Mode Design",
        href: "https://www.darkmodedesign.com/",
        dateAdded: "2026-07-14",
        description:
          "Gallery specifically curating sites and products with well-executed dark mode design. Open to submissions: creators pitch their own dark-mode site by emailing hello@darkmodedesign.com with 'Site Submission' as the subject.",
      },
      {
        title: "Next.js Design",
        href: "https://www.nextjs.design/products",
        dateAdded: "2026-07-14",
        description:
          "Showcase of products and sites built with Next.js, for seeing what real Next.js apps look like in production. Sits inside a broader Next.js dev-tools directory, so browsing /products pairs shipped apps with the libraries and tools that built them.",
      },
      {
        title: "Pillarstack",
        href: "https://www.pillarstack.com/resources/doing-cool-stuff",
        dateAdded: "2026-07-14",
        description:
          "Design resource collection under the theme 'doing cool stuff', a grab-bag of inspiring tools and references. One bookmark inside Pillarstack, a personal frontend-resource dump made and curated solo by developer HuyNG (huyng.xyz).",
      },
      {
        title: "Craftwork catalog",
        href: "https://craftwork.design/catalog?filterByPrice=paid_free&sort=recent",
        dateAdded: "2026-07-14",
        description:
          "Marketplace catalog of design assets (templates, illustrations, UI kits) filterable by price, this link is sorted to show recent free and paid items. Studio marketplace 'designed in Bangkok, supplied worldwide' spanning 51+ catalog pages across 3D, Framer, Figma, Webflow, and Notion templates.",
      },
      {
        title: "Shoot Design",
        href: "https://www.shoot.design/",
        dateAdded: "2026-07-14",
        description:
          "Design inspiration gallery, screenshots of notable websites organized for browsing. Narrower than general site galleries, this one is scoped specifically to app screenshots and app icon design, not full desktop sites.",
      },
      {
        title: "Websitevice",
        href: "https://websitevice.com/examples-5",
        dateAdded: "2026-07-14",
        description:
          "Website design inspiration gallery, this link points at one of its curated example collections. Built by solo designer Devluc, organizing examples into 45+ hyper-specific niches like bakery, dentist, and law firm sites.",
      },
      {
        title: "Osmo collection",
        href: "https://www.osmo.supply/collection",
        dateAdded: "2026-07-14",
        description:
          "Osmo Supply's collection of interactive web experiments and design references, from the studio known for creative, high-craft site builds. Every effect ships with dual documentation for both no-code Webflow and vanilla HTML/CSS/JS, plus a standalone pack of 50+ button styles.",
      },
      {
        title: "Landing Love",
        href: "https://www.landing.love/",
        dateAdded: "2026-07-14",
        description:
          "Gallery specifically of landing page designs, for studying how real products structure their marketing pages. Catalogs over 2,100 sites with full-page video recordings, filterable by tech tags like GSAP, WebGL, and Three.js.",
      },
      {
        title: "Best Designs on X",
        href: "https://bestdesignsonx.com/",
        dateAdded: "2026-07-14",
        description:
          "Curated roundup of well-designed sites and products that have been shared and praised on X (Twitter). Sources picks straight from X posts and threads rather than submissions, surfacing designs as the design-Twitter crowd flags them live.",
      },
      {
        title: "Figma community resources",
        href: "https://www.figma.com/files/team/1072912386122463093/resources/community/file/1403172659817779958",
        dateAdded: "2026-07-14",
        description:
          "Shared Figma community file with design resources: components, templates or references published for others to duplicate and use. Sits inside Figma's own community system behind a login wall, so duplicating any resource requires a signed-in Figma account first.",
      },
      {
        title: "Viewport UI",
        href: "https://viewport-ui.design",
        dateAdded: "2026-07-14",
        description:
          "Curated gallery of UI design work organized by platform (web, mobile, iOS, Android), with links back to the designers who made it. Built by two designers, Fer and Eryc, since 2023, spanning nine categories from Watch and Icon to Motion, with community submissions via Twitter.",
      },
      {
        title: "ui.live",
        href: "https://ui.live",
        dateAdded: "2026-07-14",
        description:
          "Social platform for designers to post their work, rank up on trending leaderboards, and get discovered, a competitive spin on design inspiration feeds. Ranks drops on time-windowed leaderboards (today, week, month, all-time), turning inspiration browsing into a competitive submit-and-climb game via its /add flow.",
      },
      {
        title: "UIBits",
        href: "https://uibits.co",
        dateAdded: "2026-07-14",
        description:
          "Curated feed of small UI component snippets for quick reference and reuse. Organizes by individual component type (buttons, cards, nav bars) rather than full pages, so it's faster for grabbing one ready snippet than browsing whole-screen galleries.",
      },
      {
        title: "Details Matter",
        href: "https://detailsmatter.framer.website",
        dateAdded: "2026-07-14",
        description:
          "Showcase collecting small, easy-to-miss UI details from real products, the kind of polish that separates good interfaces from great ones. Presents each entry as a short video clip, sourced from named products like Airbnb, Discord, Spotify, and Telegram, with a Google Form for submissions.",
      },
      {
        title: "Another Graphic",
        href: "https://anothergraphic.org",
        dateAdded: "2026-07-14",
        description:
          "Archive of graphic design focused on typographic treatment, curating editorial, identity and poster work from international designers, browsable by designer, year, medium or country. Runs as an open, crowdsourced submission archive rather than an editorially closed collection, so working designers add their own posters and identities directly.",
      },
      {
        title: "Pageflows: iOS",
        href: "https://pageflows.com/ios",
        dateAdded: "2026-07-14",
        description:
          "Library of recorded UX flows captured from real iOS apps, useful for studying how shipped products actually handle onboarding, checkout and other common flows. Paid product with a 3-day trial, pairing full flow videos with a separate searchable library of individual UI components like buttons and text fields.",
      },
      {
        title: "Screens Design",
        href: "https://screensdesign.com",
        dateAdded: "2026-07-14",
        description:
          "Gallery of mobile app screen designs organized by pattern and category, for browsing how real apps solve specific UI problems. Best suited for pulling many apps' takes on one specific screen (e.g. paywalls or empty states) side by side, not just browsing single full flows.",
      },
      {
        title: "User Inyerface",
        href: "https://userinyerface.com",
        dateAdded: "2026-07-14",
        description:
          "Game that makes you fight the worst dark-pattern UI ever built: fake buttons, hostile forms and deliberately confusing flows, a memorable way to feel why good UX matters. Built by Belgian digital agency Bagaar, originally released to coincide with World Usability Day and later named an Awwwards Site of the Day.",
      },
      {
        title: "Nicely Done",
        href: "https://nicelydone.club",
        dateAdded: "2026-07-14",
        description:
          "Teardown reviews of well-designed products, breaking down the specific decisions that make them work. Backs its teardowns with a massive raw archive: over 194,700 screens and 12,500 full user flows captured from 500+ real SaaS products.",
      },
      {
        title: "Hoverstat.es",
        href: "https://www.hoverstat.es",
        dateAdded: "2026-07-14",
        description:
          "Curated gallery of standout personal and studio portfolio sites, organized around featured designers. Runs as an open submission gallery, so each entry carries a date and a short curator note naming the exact hover or scroll technique used.",
      },
      {
        title: "Craftwork: onfire",
        href: "https://onfire.craftwork.design",
        dateAdded: "2026-07-14",
        description:
          "Trending premium design assets currently popular on Craftwork's marketplace. This drop is 20 illustration scenes in 2 styles as SVG and PNG, pulled from Craftwork's wider 2,800+ piece Storytale library.",
      },
      {
        title: "Trending Design",
        href: "https://trending.design",
        dateAdded: "2026-07-14",
        description:
          "Curated marketplace recommending products for creative professionals across three categories: design tech (devices and tools), design books and design documentaries, each with independent reviews. Funded by affiliate commissions, including Amazon links, on the products it recommends rather than paid or sponsored placements.",
      },
      {
        title: "Interfaces (rauno)",
        href: "https://interfaces.rauno.me",
        dateAdded: "2026-07-14",
        description:
          "Rauno Freiberg's curated collection of great interface details, screenshots of specific, well-executed UI moments from real products. Organized into roughly 50 numbered rules across 7 sections (interactivity, typography, motion, touch, optimizations, accessibility, design), each footnoted with sources.",
      },
      {
        title: "Midday",
        href: "https://midday.ai",
        dateAdded: "2026-07-15",
        description:
          "Open-source financial OS for freelancers and small businesses (invoicing, time tracking, bank reconciliation), by Pontus Abrahamsson; featured twice on One Page Love for its interface craft. Connects to 25,000+ banks and 100+ tools (Stripe, QuickBooks, Slack) and claims to cut 4-6 hours of weekly admin work.",
      },
    ],
  },
  {
    title: "Portfolios and studios",
    links: [
      {
        title: "Bruno Simon",
        href: "https://bruno-simon.com",
        dateAdded: "2026-08-21",
        kind: "portfolio",
        stack: ["three", "webgl", "webgpu", "tsl", "rapier", "howler"],
        useFor: [
          "3d portfolio",
          "webgl portfolio",
          "drivable portfolio",
          "game like website",
          "interactive 3d site",
          "three.js showcase",
          "creative developer portfolio",
        ],
        description:
          "Portfolio of Bruno Simon, a creative developer, built as a drivable 3D world: you steer a car with WASD, touch or a gamepad around an island, and his projects are places you park next to. The 2025 build runs on Three.js with TSL, the Three.js Shading Language, which is what lets one scene render through either WebGL or WebGPU, plus Rapier for physics and Howler for audio. Things accumulate around the driving: six unlockable car skins, a timed circuit with a daily top ten, and whispers, public messages capped at 30 characters and 30 at a time so new ones push old ones out. Source is at brunosimon/folio-2025 under MIT with the Blender files included, server code deliberately withheld; he also runs the Three.js Journey course and posted devlogs of the build as a YouTube playlist, with music by Kounine under CC0.",
      },
      {
        title: "Lynn Fisher",
        href: "https://lynnandtonic.com",
        dateAdded: "2026-08-21",
        kind: "portfolio",
        stack: ["css", "svg", "responsive"],
        useFor: [
          "responsive design experiment",
          "breakpoint layouts",
          "css only site",
          "playful personal site",
          "media query ideas",
          "resize the browser",
          "designer portfolio",
        ],
        description:
          "Personal site of Lynn Fisher, a designer for the web, rebuilt from scratch nearly every year and known for making browser width the entire interaction. The 2017 version ran 20 media queries so the layout changed completely every 100px, 21 distinct layouts in one site, on her reasoning that people already expect something to happen at tablet and phone widths, so the surprise has to be pushed to an absurd extreme. Each later refresh takes a different angle: 2018 zooms from something small out into space, 2019 cracks illustrations open as you widen, 2021 stacks SVG scenes and transitions between them through cutouts, 2023 uses ResizeObserver to show a version only while you are actively resizing, and 2025 is fixed width but stretches like elastic and bounces back when you stop. Every version is kept in an archive and each one gets a written case study; the current site is marked v. XIX.",
      },
      {
        title: "Robb Owen",
        href: "https://robbowen.digital",
        dateAdded: "2026-08-21",
        kind: "portfolio",
        stack: ["webgl", "svg", "design-systems"],
        useFor: [
          "creative developer portfolio",
          "independent developer site",
          "vscode theme",
          "synthwave 84",
          "viewport state library",
          "personal site with writing",
        ],
        description:
          "Site of Robb Owen, an independent creative developer based in Abergavenny, South Wales, working across interaction design, scalable design systems, single page apps and more experimental WebGL, with a stated preference for the wilder the better. The open-source releases are the part worth taking: SynthWave '84, the VS Code colour scheme he built after failing to find one he liked, which passed two million downloads in October 2024; Tornis, a small library that watches viewport state and exposes screen size, cursor position, scroll position and gyroscope data as a store; and Rekishi, a thin pub/sub wrapper over the History API for dynamic page transitions. Structured as Work, About and Writing, footer signed Gwneud yn Ne Cymru.",
      },
      {
        title: "Ben Howdle",
        href: "https://benhowdle.im",
        dateAdded: "2026-08-21",
        kind: "portfolio",
        stack: ["react", "node", "graphql"],
        useFor: [
          "fractional cto site",
          "consultant landing page",
          "engineering advisor",
          "track record section",
          "personal site for services",
          "developer selling services",
        ],
        description:
          "Site of Ben Howdle, a UK based fractional CTO and engineering advisor with 16+ years in and two startup CTO roles behind him, worth reading as a structure for selling engineering services off a personal domain rather than a company one. Track Record is a horizontally swipeable carousel instead of a vertical list, running Snug, Clerk, WorkMade, Letter, GoDaddy, mytheresa, Soho House, Plasso, Cisco, Kayako and KashFlow with dates and one concrete line each, and testimonials expand in place through Read full note. Products sit next to the consulting: ReqRes, a hosted fake API running since 2015 and claiming 150M+ requests a month, plus 15+ shipped since 2014 including Somna, Everyday Stoic, Content Caddy, Shades and Ekko, two of them sold. Three offers are named and scoped, a 3 week Engineering Diagnostic, a fractional CTO retainer and a 3 month transformation engagement, and his book The First CTO is £12 as an ebook or £79 with the playbook and toolkit.",
      },
      {
        title: "Tim Holman",
        href: "https://tholman.com",
        dateAdded: "2026-08-21",
        kind: "portfolio",
        stack: ["javascript", "css", "canvas"],
        useFor: [
          "playful web experiments",
          "creative coding toys",
          "fun side projects",
          "personal site of experiments",
          "weird web",
          "novelty js library",
        ],
        description:
          "Site of Tim Holman, who calls himself a tinkerer, tuner and tamperer drawn to weird tech and play in tech, and who is Senior VP of UI and UX at Goldman Sachs after directing product engineering at Bustle Digital Group. The page is a plain wall of links to hundreds of small things he has made, which is the reason to visit: the ones that spread furthest are GitHub Corners (the fork me ribbons), Elevator.js (a back to top scroll that plays elevator music on the way), Intense Images, Obnoxious.css, ASCII Morph and The Useless Web. Recent work went into browser toys grouped one per domain, covering paint, memory, sliding puzzles, mazes, dice, solitaire variants and poetic composers for sestinas, haiku and sonnets, alongside Generative Artistry tutorials and preservation projects like Sites We Lost and The Vintage Web. Talks listed at JSConf AU, JSConf Asia, FFConf, CSSConf EU and Bang Bang Con.",
      },
      {
        title: "Locomotive",
        href: "https://lisa.locomotive.ca/en",
        dateAdded: "2026-08-18",
        kind: "portfolio",
        useFor: [
          "agency site",
          "montreal design agency",
          "digital first agency",
          "studio work page",
          "bilingual agency site",
        ],
        description:
          "Site for Locomotive, an independent digital-first agency in Montreal, Quebec, which sells itself on a deep skill set, big ideas and a global reputation rather than on a service list. Structure is the agency standard (Work, Agency, Careers, a separate store at store.locomotive.ca) with an English and French toggle and a single Let's talk contact CTA. Note the host: it is served from a lisa. subdomain whose interface strings still carry a lisa. namespace, so this reads as a build of the agency site rather than a product of its own.",
      },
      {
        title: "Man Made Designs",
        href: "https://www.manmadedesigns.in/#services",
        dateAdded: "2026-08-18",
        kind: "portfolio",
        useFor: [
          "design studio site",
          "brand identity studio",
          "design retainer",
          "studio services page",
          "ongoing design partnership",
        ],
        description:
          "Site for Man Made Designs, a small multidisciplinary studio selling brand strategy and identity, website design and build, marketing materials, and an ongoing design partnership pitched as an in-house team without the overhead of managing employees. Read it as a positioning example rather than a work reference: capacity is stated in public as a limit of 3 clients at a time, intro is a 15 minute Cal.com call, and the testimonials name Li.fi, Spykefast, Creator Mail, DeFi Raccoons, The Blocklane and Southville Cafe, one of them a relationship of almost 3 years. The FAQ asks how much it costs and never answers, and both portfolio sections still read Coming soon.",
      },
      {
        title: "Run Rob Run",
        href: "https://www.runrobrun.com/",
        dateAdded: "2026-08-18",
        kind: "portfolio",
        stack: ["webflow"],
        useFor: [
          "webflow portfolio",
          "creative developer portfolio",
          "motion reel",
          "scroll indexed reel",
          "personal portfolio site",
          "portfolio with audio player",
          "webflow editorial site",
        ],
        description:
          "Portfolio for Robert Aperios, a creative developer building in Webflow, worth reading for how it structures a services page as five numbered areas ([01] to [05]: visual systems, front-end craft, motion language, brand presence, concept to form) instead of a paragraph. The work is four Webflow builds: Dash, a studio template with a CMS structure and script-led motion; Racepoint, an editorial system of custom page templates; Commuter, a CMS-driven film portfolio; and Roger W Smith, an archive for a luxury watchmaker built around pacing. A tools reel indexed 000 to 004 cycles five motion studies named Runman, Chroma Warp, Split Mask, Text Maze and Whale, and a Press Play control runs three tracks underneath the browse. Footer carries English, Dansk and Portugues.",
      },
      {
        title: "Mirage at Apple Park",
        href: "https://mirage.place/map/",
        dateAdded: "2026-08-07",
        stack: ["lottie", "scroll"],
        useFor: [
          "scroll driven map",
          "interactive world map",
          "art installation site",
          "map based navigation",
          "scrollytelling site",
          "place based storytelling",
          "editorial project site",
        ],
        description:
          "Project site for Mirage, a permanent sculpture by Katie Paterson and architecture studio Zeller & Moye at Apple Park, worth the visit for how its map page carries a large set of places without collapsing into a list. Scrolling drives a Lottie world map projection while a Select view type control swaps between the map and an Installation View, so the same 70 desert sources read either as geography or as their position in the piece. The work itself is 448 cast glass columns standing two metres in the olive grove by the Visitor Center, each poured from wild sand gathered from a single desert, with per sand glass recipes worked out at Delft University of Technology and casting by John Lewis Glass in Oakland. The rest of the site holds the same restraint, down to a Sand Catalogue whose 70 entries carry only a thumbnail and a place name before opening onto their own pages; no studio is credited for the build.",
      },
      {
        title: "WeGrow",
        href: "https://www.wegrow.design/",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        useFor: [
          "design subscription",
          "ai startup branding",
          "b2b brand identity",
          "startup design partner",
          "pitch deck design",
          "outsourced design team",
        ],
        description:
          "Studio selling itself as a subscription in-house design team for B2B AI companies, covering brand strategy, naming, visual identity, web, decks, motion, 3D, illustration and development under a single plan rather than per project quotes. The pitch leans on outcomes over craft language, leading with Noxtua raising 80.7 million euros after a rebrand and site launch with them, and a founder quote from Mark OS. Terms are stated plainly on the page: senior designers only, revisions until the client signs off, regular status updates, work starting within 24 hours of one strategy call and no ticket queue. Useful as a reference for how the productized design subscription model is positioned right now, and the site itself is a tidy example of the genre, built in Framer.",
      },
      {
        title: "Applied Archive Atelier",
        href: "https://www.appliedarchiveatelier.com/",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        stack: ["sanity", "mux"],
        useFor: [
          "nonprofit branding",
          "cultural institution website",
          "mission driven studio",
          "social impact design",
          "studio manifesto page",
          "bilingual website",
          "charity website design",
        ],
        description:
          "Site for Applied Archive Atelier, a bilingual Montreal creative studio working with non-profits, cultural institutions and social businesses, on the stated position that a mission deserves the same strategy and craft as any commercial brand. The manifesto page is the reason to open it: the studio's stance is set out as five verbs, Welcome, Cultivate, Illuminate, Craft and Amplify, each carrying a single line, including a promise to fashion living archives equal to the desires of the age. Work is shown as seven specific projects rather than a reel, covering Routes to Rootz, MAPP_MTL 9.5, Brique par Brique, chimie, CTRL+ALT, Leadership for the Ecozoic and Ellipse Magazine across identity, campaign, editorial and web. The people page is the unusual part, listing 38 names whose roles run from Colorist and Sound Editing through to the Director of Brique par Brique, a Concordia design professor and an analyst at Microcredit Montreal, so it reads as a network of collaborators, clients and named creative mentors rather than a staff list; Jean-Julien Hazoume appears there under creative direction, design and web development. The studio also runs its own initiatives, among them Gia, which translates the work an organization already does into language a grant application will recognize.",
      },
      {
        title: "ISKRA.GRAPHICS",
        href: "https://iskra.graphics/",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        stack: ["canvas", "webaudio"],
        style: ["editorial", "maximalist"],
        useFor: [
          "digital design studio",
          "print inspired web design",
          "cmyk aesthetic",
          "webgl wordmark",
          "file drawer interaction",
          "ink and paper aesthetic",
          "branding studio site",
        ],
        description:
          "Site for ISKRA.GRAPHICS, a digital design studio covering web design, branding, UI/UX and launch videos for startups and founders, working worldwide from London and booking 15 minute intros over Telegram rather than a contact form. The page is staged as a CMYK print job: cyan, magenta and yellow registration squares in the kicker, sections alternating between paper and ink, and a WebGL steel wordmark behind a tilted metal star whose blade crosses over the final A. Work is filed rather than listed, in a drawer of folders numbered ISK-2601 to ISK-2605 that you pull open one at a time, each flooding the drawer with its own ink color and showing stack, timeline and result, so you get Next with R3F and GSAP in 5 days for a live-3D portfolio and Vite with Canvas and WebAudio in 4 days for a scratch-ticket promo, with two of the five still marked in production. It closes on a Lab of miniature experiments that load on scroll and pause off-screen, and an access pass you tilt to catch the foil.",
      },
      {
        title: "Robert Borghesi",
        href: "https://robertborghesi.is/",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        stack: ["webgl", "three", "react-three-fiber"],
        style: ["terminal", "minimal"],
        useFor: [
          "webgl developer portfolio",
          "creative coder portfolio",
          "immersive web experiences",
          "terminal style portfolio",
          "award winning webgl site",
          "generative art portfolio",
        ],
        description:
          "Portfolio of Robert Borghesi, an economist turned creative coder specialising in WebGL and immersive experiences, freelance since 2018 across generative art, creative coding and some web3. The client list carries it: Gucci across Horsebit, Let Girls Dream and 24 Hour Ace, Google's Medusae Art Project, Zulu for Longines, plus Adidas, SAP, Valentino, LG and MaxMara, agency work through Immersive Garden, OddCommon, Demodern, Dentsu and Antinomy, and a What is Missing build for Maya Lin carrying a triple Webby. Tallies run 1 FWA Site of the Month, 17 FWA Site of the Day, 10 Awwwards Site of the Day and 7 Webbys. The site itself is dry and technical rather than cinematic: a status readout reading READY beside the line PRETENDING TO LOAD, a version stamp, navigation compressed to bracketed triplets like (PRJ) (WHO) (MSG), and projects indexed by slashed year against client name, closer to a ledger than a case study reel. He also teaches at Harbour Space in Barcelona and wrote up procedural clouds with Three.js sprites for Codrops.",
      },
      {
        title: "Poetic",
        href: "https://poetic.com/",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        style: ["minimal", "product-dense"],
        useFor: [
          "clean enterprise site",
          "ai company landing page",
          "dark marketing site",
          "enterprise saas design",
          "b2b landing page",
          "stat heavy landing page",
        ],
        description:
          "Marketing site for Poetic (legal entity Lever AI), an enterprise AI company whose product learns a business process from videos, operating procedures and historical examples, tightens it through an expert feedback loop, then self-heals when the underlying apps change. Worth saving for the design more than the pitch: dark, high contrast and quiet, with layered compositions that set an inner image (a SoFi Mastercard, a data-grid globe, curved architecture) behind oversized statistic numerals, and feature cards carrying simulated product UI down to browser chrome reading ellisonbank.internal/disputes. The proof points are unusually concrete for the genre, naming SoFi, Chime at 500,000 disputes handled and AIG, with quotes from Anthony Noto and Peter Zaffino, over a footer row of SOC 2 Type II and PCI DSS badges.",
      },
      {
        title: "Bakai Tolondu uulu",
        href: "https://www.bakai.me/lab",
        dateAdded: "2026-07-28",
        kind: "portfolio",
        stack: ["ios", "mobile", "ui"],
        style: ["product-dense", "minimal"],
        useFor: [
          "mobile app design",
          "ios app design",
          "app design inspiration",
          "mobile ui inspiration",
          "ios app screens",
          "mobile screen design",
          "expense tracking app",
          "sidebar design",
        ],
        description:
          "Mobile app design reference: a lab shelf of app and interface screens by Bakai Tolondu uulu, a design engineer in San Francisco, originally from Kyrgyzstan, working at an AI agency while studying at Minerva University. Around sixteen screens across four named pieces: Sidebars, a study of navigation panel variants; Oymo and Spina, two iOS apps covering scanning and expense tracking; and FOHE, an admissions CRM whose applicant board is worth the visit on its own, splitting a pipeline into Waiting, Ready for review, Ready for decision and Decided with live counts on each column. No case study text, just the screens, so it reads as a working shelf rather than a portfolio narrative.",
      },
      {
        title: "creatoroly",
        href: "https://creatoroly.com/",
        dateAdded: "2026-07-22",
        kind: "portfolio",
        stack: ["motion", "design"],
        style: ["restrained-motion", "liquid-glass", "minimal"],
        useFor: [
          "motion designer portfolio",
          "motion design",
          "apple inspired motion",
          "restrained motion",
        ],
        description:
          "Portfolio of Oly (@creatoroly), a motion designer whose whole pitch is restraint: the tagline literally spells out motion that feels c, l, e, a, n. Clients include Whop, Moonshot, ether.fi, Tradezella and Jigsaw; named pieces include an Apple-inspired fintech concept called Pool, a 30 second Moonshot x Bone spot built around rhythm and pacing, and an iOS 27 Liquid Glass fan concept. Also sells an Apple PF Pack V2 and project files via Gumroad, so you can dissect the actual comps behind the work.",
      },
      {
        title: "Romain Avalle",
        href: "https://romainavalle.dev/",
        dateAdded: "2026-07-20",
        description:
          "Portfolio of Romain Avalle, lead interactive developer at LG2 in Montreal, with 20 years behind him: Flash work in London from 2006, five years leading a team in Paris, freelance, then Wonderland in Amsterdam. Lists 37 projects spanning 2011 to 2025 and 57 awards, including 21 Awwwards, 18 CSSDesignAwards and 16 FWA. The site is the opposite of what that record suggests: ASCII art header, monospace type and a numbered project index, no imagery doing the selling. Design by Bastien Allard.",
      },
      {
        title: "Saurabh Sharma",
        href: "https://www.srbh.site/",
        dateAdded: "2026-07-20",
        description:
          "Portfolio of Saurabh Sharma, a design engineer and full stack developer based in Jaipur, India. Projects include Ping, a chat app, and Creation Gallery, an art showcase site, alongside posts on Telegram bot automation, 3D UI with Tailwind CSS, and juggling multiple GitHub accounts. Unusual touch: a public 'Grind Log' tracking LeetCode problems and component work next to a GitHub contribution count, so the site reads as a working journal rather than a finished case study reel.",
      },
      {
        title: "AndAgain",
        href: "https://andagain.uk/",
        dateAdded: "2026-07-20",
        description:
          "London and Liverpool digital agency working across strategy, creative and technology for luxury and entertainment brands including adidas, Harrods, Disney, Google and Valentino. Work spans websites, apps, virtual events and experiential campaigns. The site itself is a study in restraint: numbered project index, generous whitespace, clean type and large full bleed imagery carrying the weight.",
      },
      {
        title: "Gurbinder",
        href: "https://gurbinder.dev/",
        dateAdded: "2026-07-19",
        description:
          "Portfolio of Gurbinder (@LegionWebDev), a design engineer and full-stack developer at Axiom. A clean minimalist site with a lifetime GitHub contribution tracker rendered as a monthly calendar, a chronological career timeline, and showcases of his open source projects Invoicely and EvilCharts.",
      },
      {
        title: "Mek Gallery",
        href: "https://www.mek.gallery/design",
        dateAdded: "2026-07-16",
        description:
          "Portfolio of Michael Alexander spanning visual art, design, typography and development, presented as a browsable gallery of his work. Alexander (b. 1990) also releases his own OpenType typefaces here, including MEKmode, MEKsans, MonoMEK and GROUT, alongside the design and dev work.",
      },
      {
        title: "Naked City Films",
        href: "https://www.nakedcityfilms.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio site for a film production studio, showcasing its directing and cinematography work. A tightly curated reel-first site, worth a look for how it lets cinematography carry the pitch with almost no supporting text.",
      },
      {
        title: "Brass Hands",
        href: "https://brasshands.com/",
        dateAdded: "2026-07-14",
        description:
          "New York design studio specializing in branding for AI, robotics, defense and other advanced-technology companies, 'designing for the new industrial age'. Founded by Kyle Anthony Miller as Brass Hands, LLC, operating under the tagline 'designing for the new industrial age.'",
      },
      {
        title: "Ning H",
        href: "https://ning-h.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of digital designer Ning Huang, expressive, code-driven websites blending art direction, interaction design and 3D. Melbourne-based Huang has picked up an Awwwards Developer Award plus Site of the Day on both Awwwards and CSSDA, on top of a Codrops feature.",
      },
      {
        title: "Maximilian Berndt",
        href: "https://maximilianberndt.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of Maximilian Berndt, an Amsterdam-based creative developer working in WebGL, motion design and design systems, with client work for Netflix, Adyen and MetaMask. Client roster also spans A24, Sotheby's, PwC, Vast, Telekom and Hansgrohe beyond the Netflix/Adyen/MetaMask work already noted.",
      },
      {
        title: "Nitish Khagwal",
        href: "https://khagwal.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of Nitish Khagwal, a product designer with 12 years of experience, known for design systems work at Paytm and Figma plugins for the design community. Shipped Ink Wireframe (Figma plugin) and Sticky Note (Figma widget), built while running Paytm's tokenized design system from 2021 to 2024.",
      },
      {
        title: "Julia Plaza",
        href: "https://www.hoverstat.es/features/julia-plaza/",
        dateAdded: "2026-07-14",
        description:
          "Featured portfolio profile of designer Julia Plaza on Hoverstat.es. Her showreel lets visitors drag video clips along a timeline to reorder her edits, built with Carlos Mayo and Jose Houdini, launched February 2023.",
      },
      {
        title: "Fabio Ottaviani",
        href: "https://www.supah.it/portfolio/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of Fabio Ottaviani, a creative developer showcasing interactive web projects. Ottaviani goes by the handle 'supah' and is best known for GLSL shader and generative-art demos published on CodePen.",
      },
      {
        title: "Arlan Marat vault",
        href: "https://www.arlan.me/vault",
        dateAdded: "2026-07-14",
        description:
          "Arlan Marat's 'vault' of design and engineering experiments, dated project entries released under an MIT license for others to use. Currently holds 13+ dated micro-experiments, like 'Ransom note' and 'Chromatic glow,' each MIT-licensed so you can lift the code directly.",
      },
      {
        title: "Jakub Krehel",
        href: "https://jakub.kr/",
        dateAdded: "2026-07-14",
        description:
          "Personal site of Jakub Krehel, a design engineer focused on craft and quality, publisher of Interfaces.dev, with writing on color systems and interface design. Previously a designer at OpenSea, now a design engineer at Interfere, a startup building what it calls 'the self-healing layer of the internet.'",
      },
      {
        title: "Here For Now",
        href: "https://www.herefornow.risd.gd/",
        dateAdded: "2026-07-14",
        description:
          "RISD Graphic Design senior thesis show site, showcasing student work across identity, print, motion and experience design under the theme of ephemeral spaces. Features roughly 30 graduating students organized into seven tracks (Identity, Print, Curation, Website, Narrative, Experience, Motion) plus a Promotion team.",
      },
      {
        title: "Anaiis",
        href: "https://www.anaiis.world/#bpe",
        dateAdded: "2026-07-14",
        description:
          "Personal or studio site for Anaiis, minimal enough that its focus isn't documented beyond the name itself. The page renders as literally just the name and a hash anchor, no bio or nav, so it works best as a bare visual reference for extreme minimalism.",
      },
      {
        title: "Samuel Bernhardt",
        href: "https://www.samuelbernhardt.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of Sam Bernhardt, a technical product designer ('usually a designer, sometimes a developer'), featuring projects like UIFork alongside writing and experimental web tools. Also hosts small hacking projects like an iPad-cursor recreation for the browser and a 'Can I Specifically Use' compatibility checker.",
      },
      {
        title: "MILEZ",
        href: "https://milez.jp/article/kxhvhoyep55g/",
        dateAdded: "2026-07-14",
        description:
          "Article on the Japanese design/culture publication MILEZ. One entry in MILEZ's article stream at milez.jp, worth bookmarking for a feed of Japanese design/culture writing rather than a single standalone piece.",
      },
      {
        title: "Emil Kowalski",
        href: "https://emilkowal.ski/",
        dateAdded: "2026-07-14",
        description:
          "Personal site and blog of Emil Kowalski, creator of the Sonner toast library and Vaul drawer component, with essays on interaction design and animation craft. Kowalski currently works on Linear's web team after a stint on Vercel's design team, and also runs the animations.dev course and index.how education project.",
      },
      {
        title: "Maxime Heckel",
        href: "https://maximeheckel.com/",
        dateAdded: "2026-07-14",
        description:
          "Blog of Maxime Heckel, a senior software engineer known for deeply technical, beautifully illustrated posts on WebGL, React Three Fiber and creative coding. Before writing on WebGL, he engineered Docker Enterprise, Cloud, and Hub at Docker after Docker acquired his startup Tutum.",
      },
      {
        title: "Gustavo Fior",
        href: "https://www.gustavofior.com/",
        dateAdded: "2026-07-18",
        description:
          "Portfolio and writing site of Gustavo Fior, featuring projects including Foglamp, an open-source tool for improving AI agents. Beyond Foglamp, he co-runs the Curitiba Coding Club and built VAYO, a bookmarks hub for internet finds, from his base in Brazil.",
      },
      {
        title: "Igochi Studio",
        href: "https://www.igochi.studio/",
        dateAdded: "2026-07-18",
        description:
          "Object and experience design studio with a quiet, editorial presentation across stories, software, editions and archival work. Organizes its output into distinct sections, stories, objects, core, archive, and editions, treating the studio itself as a curated collection.",
      },
    ],
  },
  {
    title: "Color, gradients and palettes",
    links: [
      {
        title: "GRADIENTOOL",
        href: "https://gradientool.com",
        dateAdded: "2026-07-25",
        description:
          "Gradient generator and animator by Leo Benzoni with far more control than a two-stop CSS picker: Linear, Radial and Orbit layouts, Pyramid, Wave and Noise shapes, plus peaks, direction, sweep angle, hue drift and rotation. Exports PNG or JPG at 2K, 4K or 8K, MP4 for the animated version, and a code export, with blend modes (multiply, screen, overlay, difference, lighten, darken), grain, relief, 3D depth and duotone or mono treatments layered on top. Animation duration and layers are adjustable, and a randomize button gets you to a usable starting point fast.",
      },
      {
        title: "Colir",
        href: "https://colir.space",
        dateAdded: "2026-07-21",
        description:
          "A gradient generator built around curve-based controls rather than plain linear or radial stops, so you steer the color flow along X/Y curves for results the defaults cannot reach. It adds 12 blend modes, effects like noise, glitter, feathering, and distortion, 9 built-in palettes, and GPU-accelerated real-time preview, exporting PNG or WebP at 1x to 4x. Freemium: 5 daily exports free for personal use, $7/month Pro, or a $49 perpetual license for unlimited commercial exports.",
      },
      {
        title: "Super Color Palette",
        href: "https://supercolorpalette.com/",
        dateAdded: "2026-07-14",
        description:
          "Color palette generator and browser for exploring and exporting cohesive color sets. Supports up to 24 colors across 5 groups (120 colors total) with OKHSL color space and seven harmony-generation modes, entirely free with no ads.",
      },
      {
        title: "Pattern Craft",
        href: "https://patterncraft.fun/",
        dateAdded: "2026-07-14",
        description:
          "Tool for generating and customizing CSS background patterns to copy into a project. Outputs copy-paste CSS/Tailwind background-pattern snippets rather than image downloads, letting you tweak color, size, and opacity live before grabbing the code.",
      },
      {
        title: "Gradient SCSS",
        href: "https://gradientscss.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Library of ready-made CSS/SCSS gradient definitions to copy and drop into a stylesheet. Built as a lightweight static picker: click any swatch to copy its raw CSS/SCSS variable instantly, no Sass compiler or signup required.",
      },
      {
        title: "WebGradients",
        href: "https://webgradients.com/",
        dateAdded: "2026-07-14",
        description:
          "Free collection of 180 linear gradients ready to use as CSS backgrounds, a long-running go-to gradient reference. Each gradient also ships as a downloadable PNG plus paid Sketch, Photoshop, and Figma asset packs, curated by designer Dima Braven.",
      },
      {
        title: "MyColor Space",
        href: "https://mycolor.space/gradient?ori=to+right+top&hex=%23A1C4FD&hex2=%23C2E9FB&sub=1",
        dateAdded: "2026-07-14",
        description:
          "Color and gradient tool for exploring palettes and gradients built from a chosen base color, this link opens a specific two-color gradient. Also generates two- or three-color CSS gradients from one seed hex via its Hue and 3-Color-Gradient tools, not just static palettes.",
      },
      {
        title: "Understanding Gradients",
        href: "https://jakub.kr/work/gradients",
        dateAdded: "2026-07-14",
        description:
          "Guide to how CSS gradients actually work: linear, radial and conic types, how color space affects interpolation, plus color hints, layering and performance tradeoffs for more sophisticated effects. Written by Jakub (jakub.kr) for his 'Interfaces' design-engineering essays, contrasting sRGB vs. OKLCH/OKLAB interpolation with a live conic-gradient demo.",
      },
      {
        title: "Poline",
        href: "https://meodai.github.io/poline",
        dateAdded: "2026-07-14",
        description:
          "Color palette generation library by Mikael Ainalem (meodai) that builds palettes by walking points around a color wheel in polar coordinates, producing smoother, more intentional palettes than random sampling. Ships as the tiny 'poline' npm package with eight selectable easing-style position functions (linear to sinusoidal) and a closedLoop option for seamless repeating palettes.",
      },
      {
        title: "Colorflow",
        href: "https://colorflow.ls.graphics",
        dateAdded: "2026-07-14",
        description:
          "Interactive tool from LS.GRAPHICS for generating and animating smooth, flowing gradient combinations for use in design work. Runs on WebGL at 60fps and blends via OKLab or LCH (not just RGB) across a resizable 3x3 to 5x5 point grid, with grain, blur and chromatic-aberration post-effects.",
      },
      {
        title: "Colorize",
        href: "https://colorize.design",
        dateAdded: "2026-07-14",
        description:
          "Color palette generator aimed at designers picking cohesive color sets for a project. Pulls its palette straight from a live URL rather than manual picking, offering both a visual JPG-snapshot extraction and a code-level scan of the site's HTML/CSS/JS.",
      },
      {
        title: "Colormoods",
        href: "https://colormoods.co",
        dateAdded: "2026-07-14",
        description:
          "Generates pairs of colors along a 0-100 'stimulation' scale, weighing intensity, contrast, hue separation and vibration to suggest combinations that read as calm or energetic. Built by researcher Ruxandra Duru and designer Brian Li off her essay on two-color combinations, and lets you lock one color while it searches for a match at your chosen stimulation level.",
      },
      {
        title: "Color Palette Pro",
        href: "https://colorpalette.pro",
        dateAdded: "2026-07-14",
        description:
          "Color palette generator and export tool for building and downloading cohesive color sets. Open-sourced by Ryan Feigenbaum (github.com/royalfig/color-palette-generator), it works natively in OKLCH and can output 6 palette types across 8 color spaces, including a dedicated UI dark/light mode.",
      },
      {
        title: "Harmonizer (Evil Martians)",
        href: "https://harmonizer.evilmartians.com",
        dateAdded: "2026-07-14",
        description:
          "Tool from Evil Martians that generates a harmonious color palette from a single base color, useful for quickly extending a brand color into a full UI palette. Pairs the OKLCH color model with the APCA contrast formula so every lightness step keeps identical text contrast across hues, exporting straight to Tailwind config, CSS variables, or JSON.",
      },
      {
        title: "Radix Colors",
        href: "https://www.radix-ui.com/colors",
        dateAdded: "2026-07-14",
        description:
          "Accessible, systematic 12-step color scale system for UI design from the Radix team, designed so each step has a defined semantic role (backgrounds, borders, text) across light and dark mode. Built by WorkOS with 30 scales at 12 steps each (360 colors total), using the modern APCA contrast algorithm plus P3 gamut support.",
      },
      {
        title: "Background generator (ibelick)",
        href: "https://bg.ibelick.com",
        dateAdded: "2026-07-14",
        description:
          "Generates CSS gradient and pattern backgrounds you can copy straight out as CSS, no image export needed. Built by indie developer Ibelick with Tailwind and vanilla CSS variants side by side, and the whole collection is open-sourced on GitHub.",
      },
      {
        title: "Oklch.fyi",
        href: "https://oklch.fyi",
        dateAdded: "2026-07-14",
        description:
          "OKLCH color picker and converter, for working in the perceptually uniform OKLCH color space instead of RGB or HSL. Made by Jakub Krehel, it visualizes maximum-chroma gamut mapping between sRGB and Display-P3 and includes a bulk color-conversion utility.",
      },
      {
        title: "ShapeFactory",
        href: "https://shapefactory.co",
        dateAdded: "2026-07-15",
        description:
          "Collection of browser-based logo, color and gradient tools for quickly exploring visual identity directions and exporting usable assets. Bundles four separate generators, Logo, Pigment, Gradient, and Duotone, under one roof rather than being a single-purpose tool.",
      },
    ],
  },
  {
    title: "CSS and shape generators",
    links: [
      {
        title: "Cascade (Design Surface)",
        href: "https://designsurface.dev/cascade",
        dateAdded: "2026-07-14",
        description:
          "Set of visual icons representing individual CSS properties, giving styling attributes a graphical reference instead of plain text names. Works best as a quick visual cheat-sheet during code review, spotting which CSS property a diff touches faster than reading property names.",
      },
      {
        title: "Grainrad",
        href: "https://grainrad.com",
        dateAdded: "2026-07-14",
        description:
          "Grain and noise texture generator for adding film-grain-style texture to designs. Runs entirely client-side with no upload or signup, letting you tweak grain size, roughness, and opacity live before exporting a transparent PNG overlay.",
      },
      {
        title: "Shaders.com presets",
        href: "https://shaders.com/presets",
        dateAdded: "2026-07-14",
        description:
          "Library of ready-made WebGL shader presets to drop into a project instead of writing GLSL from scratch. Presets ship as copy-paste GLSL ready for Shadertoy, Three.js, or a CSS/canvas background, organized by effect type like noise, distortion, and gradient.",
      },
      {
        title: "Blobsketch",
        href: "https://cpreid2.github.io/blobsketch",
        dateAdded: "2026-07-14",
        description:
          "Browser tool for drawing organic blob shapes by hand and exporting them as SVG for use in designs. Open-source GitHub Pages project by developer cpreid2, with the sketched blob exported as raw SVG path data you can drop straight into a clip-path or icon set.",
      },
      {
        title: "Tekdetek",
        href: "https://vikmil.com/tekdetek",
        dateAdded: "2026-07-14",
        description:
          "Browser-based VJ tool by Vik Mil for live, real-time manipulation of ASCII-style video during visual performances. Converts a live camera or video feed into ASCII characters in real time via WebGL, built specifically for on-the-fly parameter switching during a VJ set.",
      },
      {
        title: "Meshic",
        href: "https://meshic.app",
        dateAdded: "2026-07-14",
        description:
          "Procedural pattern generator for creating mesh-style visual patterns for design work. Builds patterns from a node-based mesh you can drag and reshape, aimed at generating tileable backgrounds rather than one-off static gradients.",
      },
      {
        title: "Easemaster",
        href: "https://easemaster.satisui.xyz",
        dateAdded: "2026-07-14",
        description:
          "Visual easing curve editor for animation, for dialing in a custom cubic-bezier by eye instead of guessing numbers. Built by Satish Kumar (v1.0); exports the curve directly as CSS, Tailwind, Motion, or GSAP code, with built-in spring presets like Fluid iOS and Drawer Open.",
      },
      {
        title: "Clip Paths editor (ui-layouts)",
        href: "https://tools.ui-layouts.com/clip-paths#editor",
        dateAdded: "2026-07-14",
        description:
          "Visual editor for building CSS clip-path shapes by dragging points, then copying out the generated clip-path value. Part of Naymur's ui-layouts toolkit; lets you flip between Shapes, Edited, and Custom tabs and exports straight to a React/JSX component, not just a raw CSS value.",
      },
      {
        title: "Monoco",
        href: "https://glass3d.dev",
        dateAdded: "2026-07-14",
        description:
          "Tiny JavaScript library that adds squircles and other smooth-corner types to HTML elements, generating dynamic SVG applied as a background image or clip-path. Available for vanilla JS, Svelte and React. Built by the Monokai org as three separate packages (monoco, monoco-react, monoco-svelte), so you install only the binding your stack needs.",
      },
      {
        title: "Monoco (mirror)",
        href: "https://somonoco.com",
        dateAdded: "2026-07-14",
        description:
          "Alternate domain hosting Monoco, the smooth-corner (squircle) JavaScript library. Worth bookmarking as a fallback since glass3d.dev has shown intermittent downtime; same Monokai-maintained squircle output either way.",
      },
      {
        title: "aethercss",
        href: "https://aethercss.lovable.app",
        dateAdded: "2026-07-14",
        description:
          "Free generator for Liquid Glass, Glassmorphism and Neumorphism CSS effects with a live preview: adjust sliders and colors and copy the generated code. Works best in Chromium browsers. Currently at v0.1.5 from creator djekanovic, with 12 named presets (e.g. Molten Glass, Aurora Gel, Mercury Drop) beyond the three effect categories.",
      },
      {
        title: "Lisse",
        href: "https://corne.rs",
        dateAdded: "2026-07-14",
        description:
          "Small JavaScript library that draws squircle corners, the same continuous curve Figma and iOS use. Ships bindings for React, Vue and Svelte plus a framework-agnostic core, with per-corner control, borders, and shadows included. Maintained by JaceThings on GitHub, it implements Figma's corner-smoothing algorithm plus three other curve types, outputting both SVG paths and CSS clip-path values.",
      },
      {
        title: "Liquid Glass (shuding)",
        href: "https://github.com/shuding/liquid-glass",
        dateAdded: "2026-07-14",
        description:
          "CSS/JS recreation of Apple's Liquid Glass visual effect by Shu Ding (creator of SWR/Next.js contributor), for bringing the effect to the web. Over 1,100 GitHub stars; the effect is produced by an SVG filter you can paste straight into a browser console, no build step needed.",
      },
    ],
  },
  {
    title: "Illustration and visual assets",
    links: [
      {
        title: "KYC Collection",
        href: "https://jack.art/kyc/collection",
        dateAdded: "2026-08-29",
        kind: "gallery",
        useFor: [
          "kyc collection",
          "ink hatch portraits",
          "generative portrait gallery",
          "download kyc art",
          "jack butcher kyc",
          "line art heads",
        ],
        description:
          "Jack Butcher's public archive of the KYC edition: 565 collector-saved ink-hatch portraits you can search by ID and download as still, spin, rotate or banner. Each work ships its seed and full GNM configuration (170 identity and 383 expression coefficients, 12,466 mesh vertices) so the image is reproducible. Distinct from the /kyc/create generator already on the wall. This page is the finished set, posted for download in August 2026. Ethereum collection, OpenSea slug kyc-vv.",
      },
      {
        title: "Kitbitz",
        href: "https://kitbitz.art/",
        dateAdded: "2026-08-19",
        kind: "asset",
        stack: ["svg", "figma", "mcp"],
        useFor: [
          "hand drawn illustrations",
          "free illustration pack",
          "cc0 illustrations",
          "game art assets",
          "figma illustration kit",
          "map illustrations",
        ],
        description:
          "2,043 hand-drawn illustrations across 13 themed kits, CC0 and free for commercial use with no attribution, by Sjoerd Huisman. Themes run from nature and medieval worlds through space, cities, pirates and dungeons, aimed at games, maps and playful little worlds rather than the usual flat corporate-blob illustration set. Take individual SVG or PNG files, or the Figma Community libraries with reusable components and color variables; a Figma plugin and MCP access let an agent pull assets directly.",
      },
      {
        title: "Oddgrid",
        href: "https://oddgrid.vercel.app/",
        dateAdded: "2026-08-19",
        kind: "tool",
        stack: ["svg", "generative"],
        useFor: [
          "pixel grid artwork",
          "generative pattern",
          "seeded artwork",
          "animated svg export",
          "grid texture",
          "seamless loop",
        ],
        description:
          "Browser generator for seeded pixel-grid artwork, tuned by sliders and exported as PNG, SVG, animated SVG or video at a size you choose. Controls run from aspect ratio and grid detail through fill, grain, patchiness, blockiness, block size and speckle, then cell marks, palette, color count, spread, ink and background. Drop in your own SVG to use as the cell mark, optionally recolored to ink. Animation is loop-locked: pick a movement type, intensity, fps and loop length, and it ends exactly where it started. Same seed plus same settings reproduces the artwork, space rerolls the seed and P plays or pauses. No creator is credited on the page.",
      },
      {
        title: "Create KYC",
        href: "https://jack.art/kyc/create",
        dateAdded: "2026-08-18",
        kind: "tool",
        useFor: [
          "generative portrait",
          "line art head",
          "parametric face",
          "hatching effect",
          "generative art tool",
          "export png gif",
        ],
        description:
          "Jack Butcher's generator for KYC, which renders a stylised head as ink hatching you tune live in the browser. Controls split into HEAD (rotate head, face shape, perspective), LIGHT (direction, elevation, softness) and INK (line spacing, ink weight, ink variance, white space), and the outputs are Generate, Invert, Download PNG, 360 GIF and Scan GIF at 1080 by 1080. The footer names the underlying model: a GNM head with 170 identity and 383 expression coefficients, Apache 2.0. Part of it is token-gated (you connect the wallet holding the KYC Patron Edition, and the 1/1 auction has ended), but the generator itself is the interesting part: a good study in how few parameters a convincing portrait system needs.",
      },
      {
        title: "Bible Strong Avatar Lab",
        href: "https://avatars.bible-strong.app/",
        dateAdded: "2026-08-18",
        kind: ["tool", "asset"],
        stack: ["react", "svg", "typescript", "vite"],
        useFor: [
          "procedural avatars",
          "avatar generator",
          "svg character",
          "character expressions",
          "animated avatar",
          "export react component",
        ],
        description:
          "Browser studio for building procedural 2D avatars: assemble a character from 3D-inspired geometry rendered as SVG, define its neutral face, add expressions, compose reusable animations, then export as React, JavaScript, SVG or PNG so the result runs with no dependency on the studio itself. Everything is local, with projects held in the browser and moved between machines through JSON export and import, no account or backend. Built by Stephane Montlouis-Calixte (smontlouis), the solo developer behind the Bible Strong study app, on React 19, TypeScript, Vite and Motion, with source at github.com/smontlouis/bible-strong-avatar-lab.",
      },
      {
        title: "Lummi",
        href: "https://lummi.ai",
        dateAdded: "2026-08-06",
        kind: "asset",
        stack: ["figma"],
        useFor: [
          "ai stock photos",
          "free stock images",
          "stock illustrations",
          "3d assets",
          "royalty free images",
          "unsplash alternative",
          "hero image",
          "background removal",
        ],
        description:
          "Free stock library of AI-generated photos, illustrations and 3D assets, contributed by a community of AI artists rather than produced in house, and built explicitly against the stiff corporate look of traditional stock. The FAQ cites over 16,000 royalty-free images. The license permits unlimited personal and commercial use with no credit required, on free and Pro images alike, and forbids only reselling the files or rebundling them into a competing stock service. A Pro tier adds exclusive images, higher resolutions and editing tools: Reframe extends an image into a new aspect ratio by generating new pixels instead of stretching, alongside Restyle, Retouch, background removal and Ultra upscaling. Integrates directly with Figma, Canva, Webflow, Framer and Adobe Express. Founded by designer Pablo Stanley.",
      },
      {
        title: "Ortho",
        href: "https://ortho.brdrck.me/",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["svg", "webgl", "motion"],
        useFor: [
          "isometric svg",
          "orthographic projection",
          "extrude svg",
          "3d svg",
          "rotate svg in 3d",
          "isometric illustration",
          "svg to mp4",
        ],
        description:
          "Browser-based isometric and orthographic SVG renderer: import a flat SVG from Figma, Illustrator or the clipboard, orbit it in orthographic space, extrude it into thickness, and export as SVG, PNG or MP4 with the video encoded client side. Built by Jeff (@brdrck), with nothing to install, no watermark and no server round trip. Rotation runs on quaternions so orbiting on every axis never hits gimbal lock, and the extruded volume stays vector instead of rasterizing. Past the projection it is a full editor: a keyframe timeline for rotation, position and thickness with six easing presets or a custom curve, direct vertex and bezier handle editing in 2D against a live 3D preview, and WebGL post-processing for bloom, chromatic aberration, scanlines and vignette.",
      },
      {
        title: "Holosticker",
        href: "https://www.holosticker.dev/",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["three", "webgl", "react", "vite"],
        useFor: [
          "holographic sticker",
          "holo foil effect",
          "holographic effect",
          "iridescent sticker",
          "trading card foil",
          "make a holo sticker",
          "foil texture png",
        ],
        description:
          "Holographic sticker studio: upload an SVG or PNG, tune the foil, tilt it with your cursor, and export the result as a transparent PNG. Source is at jal-co/holosticker, a static Vite build on React, TypeScript, Tailwind v4, shadcn/ui and three.js, rendering view-dependent diffraction bands, thin-film iridescence, metallic flakes and studio environment reflections in real time, so the rainbow sweeps across the foil the way it does on a real holo card rather than sitting on it as a fixed gradient. The controls reach well past a preset filter: a die-cut border derived from a euclidean distance transform, an ink control that fades artwork into the foil or densifies it into opaque print, refractor overlays with triangle, square and stripe facet patterns, and a 3D peel with conical curl.",
      },
      {
        title: "Ladybug",
        href: "https://app.theladybug.app/",
        dateAdded: "2026-07-29",
        description:
          "Image and video effects studio that runs entirely in the browser, with halftone, dither, ASCII and over 40 other effects, and nothing leaving your machine. Pick an effect and it opens on a sample clip with every control already wired up, then swap in your own media. The standout is Trace Motion, which turns movement into persistent trails and redraws that memory as ink, dither, type, dots or lines; there is also a live webcam mode, a Composite tool for layering two or more effects, and a Cyber Form Builder for shaping vector forms on an artboard. The public roadmap takes votes on what ships next.",
      },
      {
        title: "The Base",
        href: "https://thebase.design",
        dateAdded: "2026-07-29",
        description:
          "Directory of free design assets covering mockups, fonts, templates, UI kits, icons, illustrations, backgrounds, graphics and photos, all free with no paywall. Filters run on category, source (direct download or external link), and file format, with more than 20 formats including Figma, Framer, HTML, SVG and PSD. Reach for it when you need a specific asset in a specific format and do not want to open five marketplaces. The site does not name its maker.",
      },
      {
        title: "Ditther",
        href: "https://ditther.com",
        dateAdded: "2026-07-25",
        description:
          "Free browser tool by Aashish (@blurrhaus) that runs an image or video through eight pixel effects: noise dither, ASCII characters, LEGO blocks, voxels, halftone dots, dot grid, Bayer matrix ordered dither and LED display. Settings can be saved as reusable Looks so a treatment carries across a set of assets. Core tools are free forever with video export up to 1080p; Ditther Studio is a one-time $79 unlock for 4K at 60fps, 500-plus premium backgrounds and advanced presets.",
      },
      {
        title: "Mask Distortion",
        href: "https://artifacts.deeo.studio/mask-distortion",
        dateAdded: "2026-07-23",
        description:
          "An interactive experiment from DEEO Studio where a pointer-driven mask warps and distorts the layer beneath it, so the cursor smears and displaces the image rather than just hovering over it. It is one entry in DEEO's free Artifacts collection of playful motion and effect experiments (siblings include 3D Lego Dither and Emoji Glyph Dither), published April 2026 and built by Yianni Mathioudakis, the studio's co-founder and creative director. Good to study for the technique; the page is a live toy that loads the effect in the browser, not a documented export tool.",
      },
      {
        title: "3D Lego Dither",
        href: "https://artifacts.deeo.studio/3d-lego-dither",
        dateAdded: "2026-07-23",
        description:
          "An interactive experiment from DEEO Studio that renders a scene as 3D Lego-brick studs run through a dither, with your cursor left as a trailing path through the field so it participates in the rendering rather than just pointing at it. It is one entry in DEEO's free Artifacts collection of playful motion and effect experiments (siblings include Emoji Glyph Dither and Mask Distortion), built by Yianni Mathioudakis of the studio. Good to study for the technique; the page is a live toy, not a documented export tool.",
      },
      {
        title: "BDFM",
        href: "https://bitmap.designfamilymarket.com",
        dateAdded: "2026-07-21",
        description:
          "A browser tool from DesignFamilyMarket that turns any image, even a tiny one, into a pixel-perfect vector with a retro 8-bit dithered texture, exporting to SVG, PNG, or JPG. It offers 11 dithering methods, including a Stretch mode that pulls the bitmap texture horizontally or vertically, and the SVGs are kept lightweight with no junk anchor points so they stay easy to edit. Unlimited free PNG downloads; SVG exports need a Google sign-in (5 free).",
      },
      {
        title: "Simpedit Halftone Effect",
        href: "https://simpedit.com/Photo-Effects/Halftone-Effect",
        dateAdded: "2026-07-21",
        description:
          "A free, browser-based halftone generator inside Simpedit's photo-effects suite, for turning a photo into a dot pattern for pop-art or vintage-print looks. Processing stays on-device (nothing uploaded), with controls for dot size, spacing, opacity, and color mode, a live preview, brightness/saturation/sharpness adjustments, and high-resolution export. Handles JPG, PNG, and WebP; no account required. Ad-supported.",
      },
      {
        title: "tooooools",
        href: "https://www.tooooools.app",
        dateAdded: "2026-07-21",
        description:
          "A free browser-based image and video effects app by Daniil Sukhovskoy: upload, tune an effect, export. It bundles a large set of stylizers, stippling, dots, patterns, edge detection, distortion, displacement, dithering, bevel, recolor, scatter, cellular automata, gradients, CRT, and ASCII, plus preprocessing (blur, grain, gamma, black/white point) and grid controls. Works on JPG, PNG, and MP4, with keyboard shortcuts and slide/stack animation. Free for personal and commercial use, attribution appreciated but not required.",
      },
      {
        title: "Transhumans",
        href: "https://www.transhumans.xyz/",
        dateAdded: "2026-07-19",
        description:
          "Pablo Stanley's CC0 collection of open-source punk sci-fi character illustrations, made for remixing into posters, products and playful interface art. Includes a downloadable set plus individual character scenes, with matching Figma and coloring resources for adapting the visual language quickly.",
      },
      {
        title: "Popsy illustrations",
        href: "https://popsy.co/illustrations",
        dateAdded: "2026-07-14",
        description:
          "Free, customizable illustration pack (recolorable SVGs) for landing pages and product marketing. Organized into themed packs (business, startup, work, shopping) of roughly 6 to 16 illustrations each, free to use with just a popsy.co attribution link.",
      },
      {
        title: "Grafik Stash",
        href: "https://grafikstash.com/class/freebies/",
        dateAdded: "2026-07-14",
        description:
          "Design resource shop offering device mockups, icons and illustrations, both free and premium, sold via Gumroad. The freebies page currently holds 9 free items made by in-house team G-Dealer, feeding into a $99 Mega Mockup Pack upsell.",
      },
      {
        title: "Dither Garden",
        href: "https://www.dithergarden.com/editor.html",
        dateAdded: "2026-07-14",
        description:
          "Browser-based image dithering tool: upload a photo, apply different dithering algorithms and color modes, and export a stylized, retro-textured version. Packs 17 distinct dithering algorithms, from classic Floyd-Steinberg to Blue Noise and ASCII Art, exporting to PNG, JPG, WEBP, SVG, or TXT.",
      },
      {
        title: "Custom text highlight",
        href: "https://custom-text-highlight.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "CSS tool/demo for building custom text highlight effects (marker-style or background-based) beyond the default text-selection highlight. Built on the CSS Custom Highlight API (JS-registered Highlight ranges rendered via ::highlight()), not the older ::selection pseudo-element hack.",
      },
      {
        title: "Toolfolio OG Image Gallery",
        href: "https://toolfolio.io/og-image-gallery",
        dateAdded: "2026-07-14",
        description:
          "Gallery of Open Graph (social share) image designs from real products, for reference when designing your own OG images. Lives inside the wider Toolfolio directory, so you can filter the same gallery by 20+ categories or by tool integrations like Figma and Notion.",
      },
      {
        title: "SVG Logos",
        href: "https://svgl.app/",
        dateAdded: "2026-07-14",
        description:
          "Large, well-known library of brand and product SVG logos, searchable and copy-paste ready, with light/dark variants for many entries. Built solo by developer pheralb, with 665+ logos and both direct SVG grabs and a JSON API for pulling logos programmatically.",
      },
      {
        title: "Tiny Design Shop",
        href: "https://tinydesignshop.com/",
        dateAdded: "2026-07-14",
        description:
          "Shop selling tiny Carrd templates and free browser tools, lightweight, no-frills solutions for quick sites and small tasks. Sells Carrd templates as flat one-time purchases rather than subscriptions, pairing them with free micro-tools aimed at solo indie makers shipping fast.",
      },
      {
        title: "Image generation by Jakub",
        href: "https://image.jakubantalik.com/",
        dateAdded: "2026-07-14",
        description:
          "Jakub Antalik's image generation tool/experiment. A solo-built personal experiment by designer Jakub Antalik, a single-purpose generator rather than a full product like Midjourney or Ideogram.",
      },
      {
        title: "Graphite.art",
        href: "https://graphite.art",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source vector and raster graphics editor that runs in the browser, aiming to be a serious Illustrator/Photoshop-style alternative. Built by Graphite Labs, LLC in alpha with desktop release candidates for Windows, Mac, and Linux, combining node-based generative design with layer compositing via WebAssembly/WebGPU.",
      },
      {
        title: "theSVG",
        href: "https://thesvg.org",
        dateAdded: "2026-07-14",
        description:
          "Library of 6,400+ free brand SVG icons for developers and designers to download and drop into projects. Catalog currently lists exactly 6,441 icons, all recognizable company and product logos rather than generic UI iconography like Feather or Lucide.",
      },
      {
        title: "SVG Studio",
        href: "https://svgstudio.org",
        dateAdded: "2026-07-14",
        description:
          "Browser-based animation editor for turning static vector art into smooth keyframe animations, exported as self-contained animated SVGs with embedded CSS, no software or account needed. Offers four easing curves (linear, ease-in, ease-out, ease-in-out) per property track, with animation lengths from 0.5s up to 60,000s and zero runtime JS.",
      },
      {
        title: "SVG Path Editor",
        href: "https://yqnn.github.io/svg-path-editor",
        dateAdded: "2026-07-14",
        description:
          "Visual editor for SVG path data: drag control points and see the `d` attribute update live, instead of hand-editing path commands. Made by GitHub user yqnn (Yann Armelin), with dedicated controls for arc command large-arc and sweep flags, not just line and curve points.",
      },
      {
        title: "Halftone Maker",
        href: "https://halftonemaker.com",
        dateAdded: "2026-07-14",
        description:
          "Turns an uploaded image into a halftone dot pattern, the classic newsprint-style effect, adjustable in the browser. Bills itself as a stippling generator too, not just halftone dots, giving a hand-drawn pointillist texture option alongside the classic newsprint pattern.",
      },
      {
        title: "SVG Converter",
        href: "https://svgconverter.online",
        dateAdded: "2026-07-14",
        description:
          "Converts images to and from SVG format directly in the browser. Offers two distinct tracing modes, stacked layers or interlocking cutout shapes, plus a noise-reduction slider, and discards uploads immediately with no server storage.",
      },
      {
        title: "Halftone (xoihazard)",
        href: "https://halftone.xoihazard.com",
        dateAdded: "2026-07-14",
        description:
          "Another browser-based halftone generator for turning images into dot-pattern graphics. Built by Xoihazard with illustration by Sevnzel, it supports square, hexagonal, and circular dot grids, and output is free for commercial use with no attribution required.",
      },
    ],
  },
  {
    title: "Typography tools",
    links: [
      {
        title: "Runebender",
        href: "https://runebender.org/",
        dateAdded: "2026-08-18",
        kind: "tool",
        stack: ["rust", "xilem"],
        useFor: [
          "font editor",
          "edit ufo",
          "designspace masters",
          "kerning editor",
          "draw glyphs in browser",
          "variable font tooling",
        ],
        description:
          "Hosted browser build of Runebender, the Rust font editor from the Linebender project, which otherwise has to be compiled from source to run. The workspace is UFO and designspace native: a glyph overview, outline editing with advance width and metrics, an all-masters view, kerning, interpolation and autotrace, plus text preview tabs so you can set real words while drawing. The UI shell is Xilem, and an assistant panel described as able to see the open glyph, its outlines and the designspace ships as a placeholder. Who operates this particular domain is not credited on the page; the canonical project lives under linebender on GitHub.",
      },
      {
        title: "Locale",
        href: "https://joshpuckett.me/locale",
        dateAdded: "2026-07-28",
        description:
          "Single-page tool that previews every font family installed on your own machine directly in the browser, useful when picking a system typeface without opening a font manager. You type a sample sentence once and it renders across the whole local library, with size and weight controls (defaults of 72 and 400) applied to every specimen at once. Built by Josh Puckett, co-founder of Iteration and Upperstudy and previously a design lead at Dropbox, Wealthfront, and Groupon, as one of a set of small interface experiments on his site. It leans on the browser's Local Font Access API, so it needs a Chromium-based browser and a one-time permission grant.",
      },
      {
        title: "Tinkerfont",
        href: "https://tinkerfont.com/",
        dateAdded: "2026-07-21",
        description:
          "Browser extension (Chrome and Firefox) for testing typography on live websites, useful when you want to see a font change in a real page before touching a stylesheet. A right-click inspector reports the family, color, and contrast of any text, a DOM scanner lists every font in use, and you can swap in any of 1,900+ Bunny Fonts or upload your own woff2, woff, ttf, or otf. Replacements can be scoped to part of a page, persist per site, and be shared as a setup link. Made by Mighil, free to use with optional supporter contributions, and stores rules locally with no data collection.",
      },
      {
        title: "Fontshare pairs",
        href: "https://fontshare.com/pairs",
        dateAdded: "2026-07-14",
        description:
          "Font pairing tool from Fontshare (Indian Type Foundry's free font platform), suggesting complementary heading/body combinations from its free catalog. Draws from ITF's free library including General Sans, Cabinet Grotesk, and Switzer, so you can preview a pairing at real weights before copying its CSS.",
      },
      {
        title: "vibe.type",
        href: "https://typevibe.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Typography exploration tool for browsing or generating type-driven visual styles. Deployed as a bare typevibe.vercel.app build rather than a polished product site, reading more like a fast-iteration side project for browsing type moods than a full tool.",
      },
      {
        title: "Precise Type",
        href: "https://precise-type.com",
        dateAdded: "2026-07-14",
        description:
          "Web tool for building harmonious type scales from musical-interval ratios like Major Third or Perfect Fifth. Exports implementation-ready CSS and CSV, and its 'Line Grid' constraint rounds line heights to pixel multiples for pixel-perfect alignment. Made by Adonis Raul Raduca, it offers both Modular Scale and Metric Scale modes with Google Fonts integration, extending Tim Brown's modular-scale-for-web-design concept.",
      },
      {
        title: "Typograph Studio",
        href: "https://typograph.studio",
        dateAdded: "2026-07-14",
        description:
          "AI-powered custom typeface generator. Pick a style template like Neo Grotesk or Geometric, or describe the look you want, then fine-tune weight, width and contrast to produce a bespoke font. Ships 22 built-in style templates, from Neo Grotesk to Bauhaus, with granular letterform sliders like joint thickness and aperture.",
      },
      {
        title: "Fontastic",
        href: "https://fontastic.space",
        dateAdded: "2026-07-14",
        description:
          "Tool that finds mathematically complementary font pairings, taking the guesswork out of choosing a heading and body typeface that actually work together. Overlays letterform anatomy and exposes raw OpenType metrics for each Google Font, not just a pairing score, before you export CSS.",
      },
      {
        title: "Fluid Type Scale",
        href: "https://www.fluid-type-scale.com",
        dateAdded: "2026-07-14",
        description:
          "Generates a responsive fluid type scale using CSS clamp(), so font sizes scale smoothly between a minimum and maximum viewport instead of jumping at breakpoints. Built by developer Aleksandr Hovhannisyan as an open-source, MIT-licensed alternative inspired by Utopia's original fluid type scale calculator.",
      },
      {
        title: "Letterbox",
        href: "https://www.letterbox.sh",
        dateAdded: "2026-07-14",
        description:
          "Generates 'letters made of letters', text-based typographic art with controls for font, weight, fill pattern, color and column layout. Made by Charlie Clark; every composition's exact settings are encoded straight into the URL, so sharing needs no account or export step.",
      },
      {
        title: "Font Trio pairs",
        href: "https://www.fonttrio.xyz/pairs",
        dateAdded: "2026-07-14",
        description:
          "Curated three-font pairing suggestions for heading, subheading and body text, aimed at designers who don't want to hand-pick every combination. Ships 49 hand-curated heading, body and mono trios installable via a single shadcn add command, built by Dima Kapish as an open-source registry.",
      },
      {
        title: "Space Type Generator",
        href: "https://spacetypegenerator.com",
        dateAdded: "2026-07-14",
        description:
          "Kinetic type generator with over 20 animation modes (Cylinder, Field, Stripes, Coil and more) for rendering moving, space-themed typography in real time. Built solo by designer kielm and offered free with an optional tip jar, no paywall or account required to export animations.",
      },
      {
        title: "Colors and Fonts",
        href: "https://www.colorsandfonts.com",
        dateAdded: "2026-07-14",
        description:
          "Curated feed of color palette and font pairing inspiration for designers. Founded and solely run by designer Michael Andreuzza, who expanded it past the feed into interactive tools like a palette builder and semantic theme builder.",
      },
      {
        title: "Font Radar",
        href: "https://www.fontradar.com",
        dateAdded: "2026-07-14",
        description:
          "Service that scans millions of sites and apps daily to detect unlicensed font usage, helping foundries enforce licensing and recover lost revenue. Operated by EMDASH in Paris, it charges no subscription; revenue comes only from a fee taken per license it successfully gets corrected.",
      },
      {
        title: "Font name checker",
        href: "https://namecheck.fontdata.com",
        dateAdded: "2026-07-14",
        description:
          "Checks whether a proposed font or product name collides with an existing typeface name, useful before shipping a new font or brand. Built by developer Lars Schwarz as a crowdsourced directory where users register to add their own font names, not an official trademark registry.",
      },
      {
        title: "Type scale (hihayk)",
        href: "https://hihayk.github.io/scale",
        dateAdded: "2026-07-14",
        description:
          "Classic visual type-scale generator by Hayk Ohanian: pick a base size and ratio and it lays out the resulting modular scale live. Made by designer Hayk An (not Ohanian); this specific URL currently serves his color-scale generator rather than a type-scale tool.",
      },
    ],
  },
  {
    title: "Type foundries and directories",
    links: [
      {
        title: "Fonts In Use",
        href: "https://fontsinuse.com/",
        dateAdded: "2026-08-18",
        kind: ["directory", "gallery"],
        useFor: [
          "font in use",
          "font usage examples",
          "who uses this font",
          "typography archive",
          "album art typography",
          "poster typography",
        ],
        description:
          "Independent archive of typography in the wild, running since 2010, indexing 34,320 documented uses with 6,332 staff picks, so you can see where a typeface has actually been set before committing to it. Browse by face (Helvetica at 1,508 uses, Futura at 1,232, Univers at 652, Akzidenz-Grotesk at 440), by 34 topics such as Music, Art, Event, Literature and Activism, or by 20 formats including branding and identity, books, posters, web and album art, then sort by artwork date to work era by era back through 1950s specimens. Entries are contributed and credited to individuals and foundries, free to read, funded by sponsors, with an advanced search for combining terms and four RSS feeds.",
      },
      {
        title: "Luzi Type",
        href: "https://luzi-type.ch/index",
        dateAdded: "2026-08-12",
        kind: "asset",
        useFor: [
          "swiss type foundry",
          "messina sans",
          "license a typeface",
          "font superfamily",
          "font with many weights",
          "sans serif family",
          "brand identity typeface",
        ],
        description:
          "Swiss type foundry and design studio whose copyright line dates to 2013, worth browsing when a project needs one family deep enough to carry a whole identity rather than a single display cut. The catalogue runs to 27 families and leans hard on superfamilies: Spezia Serif ships 144 weights across three subfamilies, Spezia 128 across nine, Zeist 108 in a single family and Messina Sans 40 across three, next to smaller faces like Faro, Koper, Nantes and Yport at 7 to 12 weights. Messina Sans is the one you have already read without noticing, since MIT's site is set in it, Tylko's Furniture that fits campaign used it, and Smith & Diction built Superhuman's identity on a customised Messina. A Notes section writes up the thinking behind each release, including Isola as a remake of Venus Grotesk and Valpo's calligraphic roots, and Test Fonts offers trial files, though licence tiers and prices sit behind the Licence Guide and Shop rather than anywhere on the index.",
      },
      {
        title: "CcTimeline",
        href: "https://cctype.com/typefaces/cc-timeline",
        dateAdded: "2026-07-29",
        description:
          "A 2026 release from CcType, the foundry run by studio Koto, drawing on three eras of typographic history: metal type, phototypesetting, and digital. It ships as a multi-axis variable font with weight and contrast axes, 18 styles across three subfamilies (Timeline, Timeline Mid, Timeline High) from Light to ExtraBold, in OTF, TTF, WOFF and WOFF2. Character set covers Latin and Thai, with 14 OpenType features including alternate G and R, stylistic sets for square shapes and short ascenders, fractions and tabular figures. Trial fonts are free for testing and mockups; commercial work needs a paid license.",
      },
      {
        title: "Typewolf",
        href: "https://www.typewolf.com",
        dateAdded: "2026-07-25",
        description:
          "Typography reference that identifies the fonts used on notable websites, so you can see how a typeface performs in production before licensing it. Run as a side project by independent Oregon designer Jeremiah Shoaf, with a daily Site of the Day pick, ranked font lists (Apercu holds the number one spot), Lookbooks, a Google Fonts guide and a Tuesday newsletter; it draws over 350,000 unique visitors a month. Shoaf also sells the Flawless Typography Checklist, a $399 interactive course structured as a checklist.",
      },
      {
        title: "Nouveau Grande by DDOTT",
        href: "https://ddott.net/font/nouveau-grande/",
        dateAdded: "2026-07-15",
        description:
          "High-contrast display typeface that combines an early grotesque skeleton with Art Nouveau swashes, whiplash ornaments and calligraphic alternates. Its broad OpenType set and chunky Black weight make it especially useful for expressive branding and editorial headlines. Designed by Dominik Thieme, it ships 12 styles and 889 glyphs across 29 OpenType features, with single-style licenses starting at 75.",
      },
      {
        title: "Collletttivo",
        href: "http://collletttivo.it",
        dateAdded: "2026-07-14",
        description:
          "Italian independent type foundry known for expressive, humanist typefaces and a distinctive, design-forward brand voice. A pay-what-you-want, donation-supported catalogue of 16+ open-source fonts including Borges and Apfel Grotezk, sustained by 250+ credited contributors.",
      },
      {
        title: "Open Foundry",
        href: "http://open-foundry.com",
        dateAdded: "2026-07-14",
        description:
          "Directory of free and open-source typefaces, curating quality open fonts in one place instead of digging through scattered repos. Run by Magic as a Service, it keeps the list tight at roughly 30 hand-picked free typefaces rather than aggregating thousands.",
      },
      {
        title: "League of Moveable Type",
        href: "http://theleagueofmoveabletype.com",
        dateAdded: "2026-07-14",
        description:
          "One of the original free, open-source font foundries, publishing high-quality typefaces under open licenses since the early web-fonts era. Founded by Micah Rich in 2009 under the Open Font License, its League Spartan and Raleway later became go-to Google Fonts staples.",
      },
      {
        title: "Use & Modify",
        href: "http://usemodify.com",
        dateAdded: "2026-07-14",
        description:
          "Curated directory of free and open-source fonts, filterable by style, for finding quality typefaces without licensing friction. Built by designer Raphael Bastide, it indexes 300+ fonts across 31 pages, filterable by 20+ specific license types like CC0, MIT and SIL OFL.",
      },
      {
        title: "Indestructible Type",
        href: "http://indestructibletype.com",
        dateAdded: "2026-07-14",
        description:
          "Independent type foundry publishing distinctive display and text typefaces, running since the early 2000s. Run as a one-person studio by NYC type designer Thomas Jockin, not a multi-designer collective like several other foundries here.",
      },
      {
        title: "Velvetyne",
        href: "http://velvetyne.fr",
        dateAdded: "2026-07-14",
        description:
          "French type foundry collective publishing free, open-source, often experimental typefaces (including Terminal Grotesque), a well-known source for distinctive free fonts. Hosts roughly 43 libre typefaces (VG5000, Avara, Steps Mono, Combat, Compagnon) beyond Terminal Grotesque, built by many contributing designers, not one studio.",
      },
      {
        title: "Uncut",
        href: "http://uncut.wtf",
        dateAdded: "2026-07-14",
        description:
          "Type or design resource site, didn't resolve on the last check. Blocks automated fetches with a 403 (bot or geofencing check), so it needs a real browser visit rather than scraper-style access.",
      },
      {
        title: "Free Faces",
        href: "http://freefaces.gallery",
        dateAdded: "2026-07-14",
        description:
          "Curated collection of typefaces available under free licenses somewhere on the web, organized by category (cursive, display, monospace, sans, serif, slab) by designer Simon Foster. Paginates about a dozen faces per screen across 8 pages, putting the full curated set at roughly 90-plus free typefaces.",
      },
      {
        title: "Best Free Fonts",
        href: "http://bestfreefonts.com",
        dateAdded: "2026-07-14",
        description:
          "Directory aggregating free fonts from across the web into one searchable, browsable collection. Curates exactly 214 free fonts total, shown 15 per page across sans, serif, display, script, and monospace sections.",
      },
      {
        title: "Tunera",
        href: "http://tunera.xyz",
        dateAdded: "2026-07-14",
        description:
          "Type-related site or foundry, didn't resolve on the last check. The domain currently refuses the connection outright (ECONNREFUSED), a step past a dead page, so confirm it's back before relying on the link.",
      },
      {
        title: "Typotheque Luuse",
        href: "http://typotheque.luuse.fun",
        dateAdded: "2026-07-14",
        description:
          "Independent type foundry/specimen site publishing original typefaces. The domain fails DNS resolution entirely (no such host), suggesting the project may have moved or shut down since it was catalogued.",
      },
      {
        title: "Republish font foundry",
        href: "https://republi.sh",
        dateAdded: "2026-07-14",
        description:
          "Self-initiated project by Behalf Studio that turns Vietnamese vernacular lettering (hand-painted shop signs, concrete building numerals, archival ephemera) into free, open-source digital typefaces, returned to the community they came from. Currently five families total, including Patriot (six weights, from historic songbook lettering) and Westgate (drawn from Ben Thanh Market's concrete signage), all OFL since 2020.",
      },
      {
        title: "MyFFFonts",
        href: "https://myfffonts.accentgrave.net",
        dateAdded: "2026-07-14",
        description:
          "Curated library of free, open-source typefaces spanning sans, monospace, display and variable fonts, with designer credit and licensing info attached to each. Each entry renders a live CSS preview with an editable pangram before you download, across 40+ families like Cooper, Rubik, and Fraunces.",
      },
      {
        title: "Maxibestof typefaces",
        href: "https://maxibestof.one/typefaces",
        dateAdded: "2026-07-14",
        description:
          "Hand-picked directory of free, high-quality independent typefaces, filtered down from the flood of free-font sites to ones actually worth using. Runs as one bare scrolling list with no filters, tags, or categories, favoring a single curator's judgment over a browsable database.",
      },
      {
        title: "Fonts in Movies",
        href: "https://fontsinmovies.com",
        dateAdded: "2026-07-14",
        description:
          "Catalog identifying the typefaces used in film posters, title cards and on-screen graphics, spanning movies from 1968 to 2023. Currently catalogues 52 films, with frame counts per entry ranging from 10 shots up to 62 for Isle of Dogs.",
      },
      {
        title: "Are.na: Type Type Type",
        href: "https://www.are.na/edwin-beauchamp/type-type-type-xvogvyjgxkq",
        dateAdded: "2026-07-14",
        description:
          "Curated Are.na channel collecting typography inspiration images, from signage to specimen sheets. One of thousands of niche Are.na channels; this one was started by user edwin-beauchamp and keeps growing as a running mood board rather than a fixed archive.",
      },
      {
        title: "Quarantine fonts",
        href: "https://github.com/jenskutilek/quarantine-fonts",
        dateAdded: "2026-07-14",
        description:
          "Grab-bag of unfinished typeface projects by type designer Jens Kutilek, released as raw Glyphs source files for other designers to pick up and refine, ranging from coding fonts to display faces. 94 GitHub stars and OFL-licensed since 2020, with standout drafts like a Mergenthaler Antiqua revival of Hermann Zapf's work and an IBM Selectric digitization.",
      },
    ],
  },
  {
    title: "Free typefaces",
    links: [
      {
        title: "Datatype",
        href: "https://fonts.google.com/specimen/Datatype",
        dateAdded: "2026-07-29",
        description:
          "A monospace variable font by Frank Tisellano that renders inline charts from plain text, no JavaScript involved: type {b:15,45,80,30,60} and OpenType contextual alternates turn it into a bar chart in place. It handles bar charts and sparklines (up to 20 values each, 0 to 100) via calt, and single-value pie charts like {p:75} via standard ligatures. Two axes, width 50 to 150 and weight 100 to 900, tune density and stroke thickness. Built with fontTools on glyphs from IBM Plex Mono, OFL licensed, and it works anywhere OpenType features do, including Google Docs, Sheets and Slides.",
      },
      {
        title: "Stack Sans Text",
        href: "https://fonts.google.com/specimen/Stack+Sans+Text",
        dateAdded: "2026-07-29",
        description:
          "The text-size companion to Stack Sans Notch, by Koto, drawn for body copy where the notched detailing should read as texture rather than as a feature. Variable weight axis from 200 to 700, Latin and Latin Extended, OFL licensed. Pair it with the Notch cut for headlines to get one voice across the whole type scale.",
      },
      {
        title: "Miranda Sans",
        href: "https://fonts.google.com/specimen/Miranda+Sans",
        dateAdded: "2026-07-29",
        description:
          "A screen-first sans by Max Thunberg built for text that needs to be read rather than noticed: calm proportions, open shapes, and spacing balanced to hold up over long passages. Variable weight axis from 400 to 700 with matching italics, Latin and Latin Extended, OFL licensed. The designer named it after his sister and deliberately avoided stylistic gestures, so it works as a neutral default in a UI where the type should not compete with the content.",
      },
      {
        title: "Elms Sans",
        href: "https://fonts.google.com/specimen/Elms+Sans",
        dateAdded: "2026-07-29",
        description:
          "A utilitarian geometric sans by Amarachi Nwauwa of Gida Type Studio, drawn from early geometric models but with subtle warmth in the proportions so it holds up as both display and text. Weight and italic axes spanning nine named weights from Thin to Black, built from three masters, covering Latin, Latin Extended and Vietnamese, with Sub-Saharan African Latin support in development. OFL licensed. The name is a dedication to three mentors and to the elm tree.",
      },
      {
        title: "Stack Sans Notch",
        href: "https://fonts.google.com/specimen/Stack+Sans+Notch",
        dateAdded: "2026-07-29",
        description:
          "A modernist sans by Koto whose signature is a notched cut in the letterforms, taken from the idea of a building process. Originally commissioned for Stack Overflow and released on Google Fonts under the OFL, it carries a variable weight axis from 200 to 700 across Latin and Latin Extended. This is the display cut; Stack Sans Text is the companion for body copy.",
      },
      {
        title: "Awwwards free fonts collection",
        href: "https://www.awwwards.com/awwwards/collections/free-fonts",
        dateAdded: "2026-07-25",
        description:
          "Awwwards' own curated collection of free typefaces for web projects, 289 items deep and paginated at roughly 30 per page. Includes Geist by Vercel, Nohemi, Ranade, Round 8 by atipo, HK Grotesk Wide, Aalto Display and Galgo Condensed by Giulia Boggio. Each entry links straight out to its source, usually a foundry site, Behance project or Gumroad listing, so check the license there rather than assuming the collection page settles it.",
      },
      {
        title: "Overused Grotesk",
        href: "https://github.com/RandomMaerks/Overused-Grotesk",
        dateAdded: "2026-07-22",
        description:
          "Free variable sans-serif by RandomMaerks in the Swiss neo-grotesk vein, a Helvetica-adjacent workhorse you can self-host without a license fee. Ships 10 weights (Light 300 to Black 900) with matching italics for 20 static styles, plus a variable font with weight and slant axes. Extras include 12 stylistic sets, Vietnamese and Cyrillic support, IPA, 40+ currency symbols, and tabular figures, in TTF, OTF, WOFF, WOFF2 and variable formats. SIL OFL 1.1, 774 GitHub stars, moving from FontForge to FontLab as of v0.5-alpha.2 (March 2026).",
      },
      {
        title: "Brima",
        href: "https://www.dafont.com/brima.font",
        dateAdded: "2026-07-21",
        description:
          "A handwritten script face by Christopher Gonzalez, listed on DaFont in February 2026. Fully free (marked public domain / GPL / OFL), a single style shipped as a 145 KB OTF, so it is safe to use commercially without a separate license. Around 2,300 downloads at time of writing.",
      },
      {
        title: "Backline",
        href: "https://www.dafont.com/backline.font",
        dateAdded: "2026-07-21",
        description:
          "A brush-style handwritten script by Subectype & Orenari, on DaFont since August 2022 with over 54,000 downloads. Free for personal use only, with a commercial license sold through the authors' site; the OTF carries 226 glyphs. The designers take PayPal donations and handle licensing over Instagram.",
      },
      {
        title: "Handwash",
        href: "https://www.dafont.com/handwash-2.font",
        dateAdded: "2026-07-21",
        description:
          "A casual handwritten script by One Design, listed on DaFont in November 2025 with more than 21,000 downloads. Free for personal use, with commercial use requiring paid permission (contact 111triple.studio@gmail.com); a fuller version is sold on Creative Fabrica. Shipped as an OTF.",
      },
      {
        title: "Dirtylane",
        href: "https://www.dafont.com/dirtylane.font",
        dateAdded: "2026-07-21",
        description:
          "A calligraphic script by Riyadh Rahman, one of DaFont's more popular recent scripts at over 343,000 downloads. The free download is a demo (375 glyphs) for personal use only; the commercial license is sold on the author's site or arranged via riyadhrahmanunir@gmail.com. Useful as a signature or display face.",
      },
      {
        title: "Struggle (Klotter)",
        href: "https://klotter.supply/struggle",
        dateAdded: "2026-07-21",
        description:
          "A bold open-source display typeface made for grassroots activism, created as part of the designer's bachelor thesis on design and sustainability and distributed through Klotter. It ships in two styles, Regular and a set of reversed-slant italics the designer calls rotalics, with broad Latin coverage: accents and diacritics, numerals, fractions, currency, arrows, and punctuation. OFL-licensed and downloadable as a zip.",
      },
      {
        title: "Rosette (xCicero)",
        href: "https://xcicero.esad-gv.net/page/rosette",
        dateAdded: "2026-07-21",
        description:
          "Experimental display capitals by designer Agathe Masa, part of the xCicero student type foundry's archive-revival series. It reconstructs a set of 22 incomplete capital letters of 18 ciceros whose forms follow the Series E of the Fonderie typographique francaise (Paris), so it is an intentionally partial alphabet rather than a full family. Released as version 1.0 in October 2021, distributed as a free downloadable zip.",
      },
      {
        title: "Montagu Slab",
        href: "https://fonts.floriankarsten.com/montagu-slab",
        dateAdded: "2026-07-21",
        description:
          "A slab-serif display variable typeface drawing on 19th-century models, designed by Kvetoslav Bartos and published by Florian Karsten Typefaces in September 2021. It ships 14 styles from Thin to Bold across two axes: weight and an optical-size axis that shifts x-height, spacing, contrast, and aperture between low-contrast text and tight high-contrast display cuts. 687 glyphs with ligatures, case-sensitive forms, fractions, super/subscript and scientific numerals, and a slashed zero, covering Latin, Vietnamese, and Pinyin. SIL Open Font License, downloadable from GitHub.",
      },
      {
        title: "Gidole",
        href: "https://github.com/larsenwork/Gidole",
        dateAdded: "2026-07-21",
        description:
          "An open-source geometric sans by Andreas Larsen (larsenwork), styled after modern DIN. Dual-licensed under the OFL and MIT, with source and specimen documentation in the repo. Around 1.9k stars and 68 forks; five releases, the latest switching to a direct zip download.",
      },
      {
        title: "Departure Mono",
        href: "https://departuremono.com/",
        dateAdded: "2026-07-14",
        description:
          "Free pixel-grid monospace typeface with a distinct retro-terminal look, popular for code blocks and developer-tool branding. Designed by Helena Zhang and released under SIL OFL; version 1.500 packs 1,186 glyphs including Cyrillic, Greek, small caps, and box-drawing characters.",
      },
      {
        title: "Random Grotesque",
        href: "https://randommaerks.github.io/random-grotesque",
        dateAdded: "2026-07-14",
        description:
          "Multifunctional grotesque sans-serif with an inktrap detail, inspired by Helvetica; 36 styles across three widths and six weights. 749 glyphs cover 200+ languages, and a 12-font free tier lets you test the inktrap grotesque commercially before buying the full 36-style family.",
      },
      {
        title: "Overused Grotesk",
        href: "https://randommaerks.github.io/overused-grotesk",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source sans-serif that started as a satirical Helvetica copycat and evolved into a genuinely practical, multilingual workhorse supporting 200+ languages across 16 styles. Still pre-1.0 (v0.5-alpha-1) with 1,428 glyphs under SIL OFL, so it's free to use commercially but flagged unstable for large-scale deployment.",
      },
      {
        title: "Base Neue Font",
        href: "https://befonts.com/base-neue-font.html",
        dateAdded: "2026-07-14",
        description:
          "Large type family (108 styles, thin to black, super-condensed to super-expanded) supporting 95 languages with InkTrap detailing, positioned as a modern reworking of basic grotesque typography. Built by foundry powertype with 782 glyphs per style and over 52,700 downloads logged, though it's personal-use-only, not OFL.",
      },
      {
        title: "Fixelpont (Klotter)",
        href: "https://klotter.supply/fixelpont",
        dateAdded: "2026-07-14",
        description:
          "Playful pixel font by type designer falk, originally built for a comics project. Ships in two styles, regular and rounded, that align perfectly on top of each other, with post-binary ligatures for French. Distributed free as a zip under Klotter's own CUTE license (paired with OFL), rare for a pixel font to bundle French-specific ligatures.",
      },
      {
        title: "A Mono (Klotter)",
        href: "https://klotter.supply/a-mono",
        dateAdded: "2026-07-14",
        description:
          "Free variable monospace typeface by falk, inspired by Emil Gunnarsson. Deliberately drops the serifs around narrow letters like 'i' for a bit of structured irregularity, and includes weight and 'rotalic' axes plus full IPA support. Free under OFL, with a letter-box proportioned to A4 paper, a quirky metric choice tying the glyph grid to a real-world paper standard.",
      },
      {
        title: "Thestral (xCicero)",
        href: "https://xcicero.esad-gv.net/page/thestral/index.php",
        dateAdded: "2026-07-14",
        description:
          "Contemporary display typeface by student designer Pauline Maréchal, reviving a character from the historic Jacoby & Fils foundry. Bridges vintage type craft with a modernist redraw. Version 1.0 shipped April 2024, reviving a 1930s Jacoby & Fils face tied to 3-strip/negative color-filter printing technique references.",
      },
      {
        title: "Bonbance (xCicero)",
        href: "https://xcicero.esad-gv.net/page/bonbance",
        dateAdded: "2026-07-14",
        description:
          "Playful display typeface by student designer Louna Bourdon, also rooted in a Jacoby & Fils original character. Part of the xCicero student type foundry's archive-revival series. Released as version 1.0 in October 2023 as part of the xCicero project's specimen releases, distributed as a free downloadable OTF.",
      },
      {
        title: "Caramel (xCicero)",
        href: "https://xcicero.esad-gv.net/page/caramel/index.php",
        dateAdded: "2026-07-14",
        description:
          "Display typeface by student designer Hugo Lopez, drawn from a wooden character cut by Turin's Augusta foundry. The whole specimen is presented as a caramel recipe, a visual pun between typography and confectionery. Released as version 1.0 in June 2024, also downloadable as a free OTF file directly from the specimen site.",
      },
      {
        title: "Terminal Grotesque (Velvetyne)",
        href: "https://velvetyne.fr/fonts/terminal-grotesque",
        dateAdded: "2026-07-14",
        description:
          "Free pixel font by Raphaël Bastide, inspired by Paul Renner's Futura and Radim Peško's grotesque drawings. Open source under the SIL license since 2010, with a distinctly punk, technical feel. Started life in December 2010 as a side project called Junkette, first built in Fontstruct before Bastide moved it into FontForge.",
      },
      {
        title: "Ghouls pixel blackletter font",
        href: "https://pixelsurplus.com/products/ghouls-pixel-blackletter-display-font",
        dateAdded: "2026-07-14",
        description:
          "Free pixel blackletter display font inspired by retro arcade type and modular design. Doubles as a layering font: stack copies of it and it produces a psychedelic dot effect. Designed by Rafael Nascimento; personal use is free, but commercial web licensing scales up to $700 for high-traffic and broadcast use.",
      },
      {
        title: "Acrata (Tortilla)",
        href: "https://tortilla.studio/fonts/acrata",
        dateAdded: "2026-07-14",
        description:
          "Free display typeface from Tortilla Studio's type collection. Best suited to bold, condensed headline or poster treatments, one of several no-cost display releases Tortilla Studio offers outside any subscription paywall.",
      },
      {
        title: "Arbutus Slab",
        href: "https://fonts.google.com/specimen/Arbutus+Slab",
        dateAdded: "2026-07-14",
        description:
          "Free decorative slab serif on Google Fonts, with heavy, rounded serifs that give it a friendly, vintage-poster feel. Designed by Eben Sorkin of Sorkin Type Co as the slab-serif companion to his display face Arbutus, released as a single regular weight.",
      },
      {
        title: "Trueno",
        href: "https://fontlibrary.org/en/font/trueno",
        dateAdded: "2026-07-14",
        description:
          "Free geometric sans-serif released on Font Library, popular as a lightweight alternative to paid grotesques like Century Gothic. Designed by Argentine type designer Julieta Ulanovsky and forked from Montserrat, it ships as 24 variants across 8 weights plus italic and outline styles.",
      },
      {
        title: "Inclusive Sans",
        href: "https://www.oliviaking.com/inclusivesans/feature",
        dateAdded: "2026-07-14",
        description:
          "Free typeface engineered for accessibility: non-mirroring letterforms, wider counters and generous spacing for low-vision and neurodiverse readers, plus 48 extra glyphs supporting Aboriginal and Torres Strait Islander languages. Designed by Olivia King over 3+ years, drawing on Sophie Beier's legibility research and Microsoft's Sitka typeface studies, with ongoing accessibility user testing.",
      },
      {
        title: "Santello",
        href: "https://www.dafont.com/santello.font",
        dateAdded: "2026-07-14",
        description:
          "Free modern sans-serif display font on dafont, aimed at clean, professional branding and editorial use without decorative flourishes. A single-weight display face by Aleksei Poteichuk with 346 glyphs, published May 2024 and already past 30,000 dafont downloads.",
      },
      {
        title: "Edge Cutting",
        href: "https://www.dafont.com/edgecutting.font",
        dateAdded: "2026-07-14",
        description:
          "Free geometric sans-serif on dafont inspired by the Aventa family, with the sharp, angular forms typical of the geometric-sans category. By designer RandomMaerks, it ships as four distinct cuts (Medium, Medium Italic, Sharp, Tight) rather than a weight range, with 217 glyphs.",
      },
      {
        title: "Hoky30",
        href: "https://zelowtype.gumroad.com/l/zthoky/Hoky30",
        dateAdded: "2026-07-14",
        description:
          "Retro-styled display font pack from independent foundry ZeLow Type, sold on Gumroad. Sold as a one-time Gumroad purchase rather than a subscription, so buyers own the font files outright after buying.",
      },
      {
        title: "Ta Fabricans",
        href: "https://www.dafont.com/ta-fabricans.font",
        dateAdded: "2026-07-14",
        description:
          "Free modern sans-serif on dafont with nine weights and multiple widths, built to flex across branding, editorial and interface work. Supports Hebrew alongside Latin glyphs and has racked up nearly 12,000 downloads on dafont since designer TAFT Foundry released it.",
      },
      {
        title: "Monoblock (Pixel Surplus)",
        href: "https://pixelsurplus.com/collections/free-fonts/products/monoblock",
        dateAdded: "2026-07-14",
        description:
          "Free blocky pixel monospace typeface from Pixel Surplus's free-fonts collection. Like most Pixel Surplus freebies, it's free for personal use only, with a paid tier required to unlock commercial and web licensing.",
      },
      {
        title: "GC Arbiter Mono Logic",
        href: "https://pixelsurplus.com/products/gc-arbiter-mono-logic-typeface",
        dateAdded: "2026-07-14",
        description:
          "Free monospace typeface that blends the technical feel of a coding font with a more refined, balanced letterform structure. Designed by foundry Glyphonic with 8 variable weights and 170+ language coverage, with commercial licenses scaling up to $2,800 for large deployments.",
      },
      {
        title: "WT Karsa Mono",
        href: "https://pixelsurplus.com/products/wt-karsa-mono-free-font",
        dateAdded: "2026-07-14",
        description:
          "Free monospace typeface with rigid, fixed-width structure softened by rounded corners and 45-degree diagonal cuts. Made by Indonesia's Wacana Foundry, its name comes from the Javanese word for desire or intention, the will to achieve something.",
      },
      {
        title: "TRT Interval Mono",
        href: "https://pixelsurplus.com/collections/free-fonts/products/trt-interval-mono-font",
        dateAdded: "2026-07-14",
        description:
          "Free monospace display font from Pixel Surplus's collection. Free for personal use only; like most Pixel Surplus releases, commercial projects require purchasing a separate paid license.",
      },
      {
        title: "Acro Mono Display",
        href: "https://pixelsurplus.com/collections/free-fonts/products/acro-mono-free-display-font",
        dateAdded: "2026-07-14",
        description:
          "Free monospace display font from Pixel Surplus's collection. A display-first mono with quirkier, more stylized letterforms than a coding monospace, better suited to headlines and branding than code editors.",
      },
      {
        title: "Open Sauce Fonts",
        href: "https://github.com/marcologous/Open-Sauce-Fonts",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source grotesque sans family originally commissioned by Sourcegraph, released with full variable-font support and a friendly, slightly rounded character. Actually three sub-families in one superfamily (ink-trapped Sans, clean grotesque One, rounded Two), each 7 weights plus italics, by designer Alfredo Marco Pradil.",
      },
      {
        title: "Plus Jakarta Sans",
        href: "https://github.com/tokotype/PlusJakartaSans",
        dateAdded: "2026-07-14",
        description:
          "Free geometric sans typeface family, a widely used default for SaaS marketing sites and dashboards. Designed by Gumpita Rahayu at Tokotype for Jakarta's city government rebrand, with three named stylistic-alternate sets (Lancip, Lurus, Lingkar) for varied glyph expression.",
      },
      {
        title: "Onest",
        href: "https://github.com/simpals/onest",
        dateAdded: "2026-07-14",
        description:
          "Free modern grotesque sans typeface with strong Cyrillic support, designed to feel neutral and interface-friendly across scripts. Built by Moldovan company Simpals across 7 weights from Thin to Extra Bold, blending geometric and humanist grotesque traits for small interface sizes.",
      },
      {
        title: "Aspekta",
        href: "https://github.com/ivodolenc/aspekta",
        dateAdded: "2026-07-14",
        description:
          "Free variable grotesque sans typeface built as a single variable-font file spanning the whole weight range. Designed by Croatian type designer Ivo Dolenc, spanning 20 weights from 50 to 1000 with 14 OpenType stylistic sets, OFL licensed.",
      },
      {
        title: "Urbanist",
        href: "https://github.com/coreyhu/Urbanist",
        dateAdded: "2026-07-14",
        description:
          "Free low-contrast geometric sans typeface by Corey Hu, popular for clean, minimal UI type. Modeled on Futura-style geometric proportions similar to Century Gothic, ships as a true variable font (100-900) with matching italics, MIT licensed.",
      },
      {
        title: "Albert Sans",
        href: "https://github.com/usted/Albert-Sans",
        dateAdded: "2026-07-14",
        description:
          "Free grotesque sans typeface family with a wide weight range, built as a variable font. Designed by the Usted studio as a free, OFL-licensed alternative to Google Sans, commonly swapped in for SaaS product UI.",
      },
      {
        title: "Inter",
        href: "https://github.com/rsms/inter",
        dateAdded: "2026-07-14",
        description:
          "The default UI sans-serif, used almost everywhere. Designed by Rasmus Andersson specifically for screens, with tall x-height and neutral letterforms tuned for small UI text. Originally shipped under the name 'Interface'; ships with eight opentype stylistic sets (ss01-ss08) and tabular figures, and is the system font at GitHub and Figma.",
      },
      {
        title: "Geist Font",
        href: "https://github.com/vercel/geist-font",
        dateAdded: "2026-07-14",
        description:
          "Vercel's official sans and mono typeface family, designed in-house for their product UI and documentation, and free to use in any project. Built by Vercel with Basement Studio and Andres Briganti as a Swiss-typography-inspired successor to Vercel Sans, paired with the Geist Mono coding typeface.",
      },
      {
        title: "Hubot Sans",
        href: "https://github.com/github/hubot-sans",
        dateAdded: "2026-07-14",
        description:
          "GitHub's open-source display typeface, part of its in-house type system alongside Mona Sans. Ships 72 styles across 9 weights and 3 widths, built with Degarism as Mona Sans's geometric, robotic-feeling sidekick.",
      },
      {
        title: "Mona Sans",
        href: "https://github.com/github/mona-sans",
        dateAdded: "2026-07-14",
        description:
          "GitHub's open-source variable sans typeface, used across github.com, with a wide axis range for weight and width. Packs 4 axes, including optical size (1-100) and italic, into 168 total instances with 10 stylistic sets.",
      },
      {
        title: "Rethink Sans",
        href: "https://github.com/hans-thiessen/Rethink-Sans",
        dateAdded: "2026-07-14",
        description:
          "Free grotesque sans typeface with a clean, contemporary character, released as a variable font. Traces its lineage through Poppins (Jonny Pinhorn) and DM Sans (Colophon Foundry), reworked by Hans Thiessen for Google Workspace.",
      },
      {
        title: "JetBrains Mono",
        href: "https://github.com/JetBrains/JetBrainsMono",
        dateAdded: "2026-07-14",
        description:
          "Popular monospace font built specifically for reading code: increased letter height for readability, distinct glyphs for easily confused characters, and built-in ligatures. Offers 8 weights each with italics, plus a ligature-free 'Mono NL' cut for IDEs without OpenType feature support.",
      },
      {
        title: "Source Code Pro",
        href: "https://github.com/adobe-fonts/source-code-pro",
        dateAdded: "2026-07-14",
        description:
          "Adobe's open-source monospace coding font, designed as the monospaced companion to Source Sans. Currently at upright v2.042 / italic v1.062, distributed as OTF, TTF, WOFF, WOFF2, and variable-font builds.",
      },
      {
        title: "Roboto",
        href: "https://github.com/googlefonts/roboto",
        dateAdded: "2026-07-14",
        description:
          "Google's default Android and Material Design typeface, engineered to feel natural on both screen and print at any size. Ships in 18 distinct styles under the Apache-2.0 license, maintained directly by Google's own font engineering team on GitHub.",
      },
      {
        title: "Monaspace",
        href: "https://github.com/githubnext/monaspace",
        dateAdded: "2026-07-14",
        description:
          "GitHub Next's monospace superfamily for code: five harmonized styles that share metrics so they can be mixed on one screen, plus opt-in texture healing and code-aware ligatures. Comprises five specific families, Neon, Argon, Xenon, Radon and Krypton, each a true variable font rather than static weight files.",
      },
    ],
  },
  {
    title: "Branding and logo archives",
    links: [
      {
        title: "BRRRANDING",
        href: "https://www.brrranding.com/",
        dateAdded: "2026-08-05",
        useFor: [
          "branding inspiration",
          "brand identity examples",
          "visual identity reference",
          "logo design inspiration",
          "branding case studies",
          "identity design work",
        ],
        description:
          "Curated gallery of branding projects collected from around the internet, for when you want identity work as reference rather than one studio's own portfolio. Run by Vadim Carazan on an explicitly human editorial line, put on the page as no algorithm, no AI, just great work, and on no fixed schedule beyond updating whenever something turns up worth the time. Projects arrive both from the curator and through an open Submit for Feature form, alongside a single sponsor slot. The page surfaces no project counts or client roster and browsing is a load-more feed, so it reads as a running stream to scroll rather than an indexed archive to search.",
      },
      {
        title: "Coverjunkie",
        href: "https://coverjunkie.com",
        dateAdded: "2026-07-29",
        description:
          "Archive of magazine cover design running since late 2010, now past 30,000 covers, useful when you need editorial cover reference with the credits attached. Set up and still curated daily by Jaap Biemans, art director of Volkskrant Magazine in Amsterdam. What separates it from other cover sites is the indexing: covers are searchable by publication, theme and art director, each with full credit information, so you can trace a look back to the person who made it. Biemans's stated filter is that a great cover punches you in the face and follows with a kiss.",
      },
      {
        title: "Film/Art Gallery",
        href: "https://filmartgallery.com",
        dateAdded: "2026-07-29",
        description:
          "Dealer in original vintage movie posters, worth browsing as a reference archive for poster composition and title lettering across seven decades. Owned by Matthew McCarthy, based in Los Angeles with viewing by appointment, and marking its 20th year. Stock spans the 1930s through the 2000s across US, French, Polish, Japanese, Belgian and British printings, including a dedicated Saul Bass archive and work by Drew Struzan. Filters cover director, actor, genre, decade, country, artist and size. Everything is an authentic original rather than a reproduction, priced from around $295 to $8,500 and up.",
      },
      {
        title: "The Book Cover Archive",
        href: "https://bookcoverarchive.com",
        dateAdded: "2026-07-29",
        description:
          "Long-running archive of book cover design, catalogued for the designers behind each one rather than for the books. Run by Ben Pieratt and Eric Jacobsen, with type identification credited to Stephen Coles, so entries name the typefaces as well as the designer. Browsing is plain pagination across the full collection, and the site keeps a companion directory of cover designers' own portfolio sites alongside links to other book design writing.",
      },
      {
        title: "Matchboxes from the Subcontinent",
        href: "https://matt-lee.com/matchboxes-from-the-subcontinent",
        dateAdded: "2026-07-29",
        description:
          "Matt Lee's personal archive of over 750 Indian matchbox labels, collected across ten years after he moved from London to Bengaluru in 2007. It is a study in disposable design: Hindu symbolism, historical figures, Bollywood actors, cartoon characters, consumer goods and exotic animals, printed cheaply and combined with a logic that rarely explains itself. Lee digitised the labels and wrote about the collection for Archivoz. Good reference for vernacular packaging graphics, limited palettes, and typography that was never art-directed.",
      },
      {
        title: "Visual Journal",
        href: "https://visualjournal.it",
        dateAdded: "2026-07-25",
        description:
          "Curated archive of branding and editorial design projects from studios worldwide, run by Italian art director and design manager Alessandro Scarpellini as personal research rather than a showcase of his own work. Recent features include OOAK, Oversoon, WOW, Brot, Adaptual, The Mandarin and Radici. Ad-free and funded by voluntary contributions; designers can pitch a complete case study by email and it is reviewed editorially, case by case.",
      },
      {
        title: "Brand Guidelines",
        href: "https://brandguidelines.net",
        dateAdded: "2026-07-25",
        description:
          "Handpicked library of real brand guideline documents from Adobe, Spotify, eBay, IBM, Duolingo, Dropbox, Starbucks, Klarna, Canva, Instagram and the Mastercard Foundation, for seeing how a full identity system actually gets written down. Curated by 1042 Studio, mixing free in-house guidelines the companies published themselves with paid templates from third-party studios in the $14 to $30 range. Loads roughly 30 at a time behind a Load More button; submissions go to the studio by email.",
      },
      {
        title: "Logo System",
        href: "https://logosystem.co/",
        dateAdded: "2026-07-18",
        description:
          "Free logo inspiration library of 1,200+ curated logos, wordmarks, symbols and animated logos by top designers, browsable by type, industry, style, shape, color and mood. Its moodboard tool turns a short text brief into a matching set of logo references and colors in seconds, not just static category browsing.",
      },
      {
        title: "Logggos Club",
        href: "http://logggos.club",
        dateAdded: "2026-07-14",
        description:
          "Curated catalog of well-designed logos sorted by industry, theme, typography style and brand color, with logo submission and custom design request options. The roughly 1,000-logo catalog is split by segment, about 393 tech, 302 other, 167 DTC and 138 agency, for filtering within one market.",
      },
      {
        title: "Brand Archive",
        href: "http://brandarchive.xyz",
        dateAdded: "2026-07-14",
        description:
          "Archive of brand identity work, logos and visual systems collected for reference. Favors a bare, single-column scroll of full images over the heavy category and mood filtering that sites like Logo System or Logggos build around.",
      },
      {
        title: "Rebrand Gallery",
        href: "http://rebrand.gallery",
        dateAdded: "2026-07-14",
        description:
          "Curated reference library specifically for brand designers, showcasing rebrands, identity launches and reveal videos from notable companies. Built by design studio Sahkyo with over 30,000 designers using it, offering a free tier plus a paid Rebrand Pro membership.",
      },
      {
        title: "Logo Archive",
        href: "http://logo-archive.org",
        dateAdded: "2026-07-14",
        description:
          "Positioned as the world's largest historical logo book, an extensive archive of logo design across eras and industries. Lets you filter entries by decade and industry, useful for tracing how logo trends evolved rather than just browsing a flat feed.",
      },
      {
        title: "Brand New",
        href: "http://underconsideration.com/brandnew",
        dateAdded: "2026-07-14",
        description:
          "Long-running, well-known branding criticism blog from UnderConsideration, publishing sharp, opinionated reviews of new corporate identities and rebrands as they launch. Founded by Bryony Gomez-Palacio and Armin Vit in Bloomington, Indiana, and updated daily, with some posts drawing 200+ reader comments.",
      },
      {
        title: "Cosmos",
        href: "http://cosmos.so",
        dateAdded: "2026-07-14",
        description:
          "Visual bookmarking and moodboarding tool for collecting and organizing images and references into shareable spaces. Flags AI-generated images with show/blur/hide controls and surfaces each image's original artist and source, unlike typical moodboard tools.",
      },
      {
        title: "Are.na",
        href: "http://are.na",
        dateAdded: "2026-07-14",
        description:
          "Platform for collaborative research and visual bookmarking, organizing links, images and text into 'channels' that can be connected across users, widely used by designers for building reference libraries. Founded around 2010 and funded entirely by roughly 20,500 paying members at $7/month, capping free accounts at 200 blocks.",
      },
      {
        title: "Logobook",
        href: "http://logobook.com",
        dateAdded: "2026-07-14",
        description:
          "Online archive cataloging the world's logos, symbols and trademarks, browsable by letters/numbers, shapes, objects, nature imagery and business sector. Doubles as a free prior-art lookup for designers checking whether a proposed logo or symbol already exists before filing a trademark.",
      },
    ],
  },
  {
    title: "Design essays and culture",
    links: [
      {
        title: "visualrambling.space",
        href: "https://visualrambling.space/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["webgl", "three"],
        useFor: [
          "visual essay",
          "explain with animation",
          "dithering explainer",
          "neural network visual",
          "creative coding sketches",
          "visual rambling",
        ],
        description:
          "Damar Pramudita's site of visual essays and short WebGL sketches, useful when you want a teaching technique rather than a component. Seven numbered sketches as of the fetch: paragraph layout transition, Penrose stairs, moving cubes, Truchet grid, scattered letters, cube trail, and scattered points with depth of field. Longer stories include Dithering parts 1 and 2 (Oct 2025 and Jan 2026), moving objects in 3D (Aug 2025), a visual neural-network explainer (Jul 2025), plus older pieces on K-pop, La La Land and Nolan rankings. Open for commission. X is damarberlari.",
      },
      {
        title: "Designers and Machines",
        href: "https://www.designers-machines.com/",
        dateAdded: "2026-08-05",
        kind: "directory",
        useFor: [
          "design meetup",
          "sf design event",
          "designers using ai",
          "ai design community",
          "design dinner",
          "demo night",
        ],
        description:
          "Monthly dinner in San Francisco where five designers each demo what they are building with AI, five minutes apiece. The site is a single page holding the format, the next date and a spot count, with links to the people, a chat and a play section, so it functions as an invitation rather than a publication. Worth tracking if you want to see what designers are actually shipping with these tools in a room that keeps the demos short, rather than reading another think piece about it.",
      },
      {
        title: "Sidebar",
        href: "https://sidebar.io/",
        dateAdded: "2026-08-05",
        kind: "directory",
        useFor: [
          "design links",
          "design newsletter",
          "daily design reading",
          "curated design links",
          "design news",
          "design reading list",
        ],
        description:
          "Five hand-picked design links published every weekday, worth subscribing to when you want a small edited feed instead of a firehose. It has been collecting links since October 2012, is maintained by Fabricio Teixeira after being created by Sacha Greif, and its code is open source on GitHub. Each day's five are numbered and tagged, and the mix is deliberately wide: a single day can run an essay on the plateau of sad gray icons next to a free image dithering tool, a Stack Overflow piece on why developers grow attached to their tools, and a write-up on the AI productivity gap. Anything can be submitted, including your own work, with published guidelines that steer away from low-effort posts; one slot per day is a paid sponsor placement and is labelled as such.",
      },
      {
        title: "95 reasons for having your own website",
        href: "https://bellkiosk.website/blog/reasons-to-website.html",
        dateAdded: "2026-08-05",
        kind: "essay",
        useFor: [
          "why have a personal website",
          "personal website",
          "indie web",
          "small web",
          "why build a website",
          "personal site ideas",
          "web as a medium",
        ],
        description:
          "List of 95 short reasons to run a personal site, hosted on Bell Kiosk, each one a fragment starting with 'to': to keep memories, to learn how the web works, to own your own instagram grid, to keep the like counter at 0, to remember that a website is just files and folders, to become an archipelago with your friends. It argues for the web as an artistic medium rather than a distribution channel, on the grounds that nothing else holds images, audio, video, text, time and hyperlinks at once, and it closes on a question instead of a thesis: do we need a reason to website? The 23 footnotes are the real payload, pointing at Elliott Cost's Memory and One Minute Park, Kristoffer Tjalve's Naive Weekly, Laurel Schwulst's 'My website is a shifting house next to a river of knowledge', and Anna Marl's everythingthathappened.today. No byline or date; a plain-text version, a random ordering and a companion 111-reasons page sit alongside it.",
      },
      {
        title: "Start Anywhere",
        href: "https://www.figma.com/blog/start-anywhere/",
        dateAdded: "2026-07-29",
        description:
          "Figma's print magazine for Config 2026, announced here by Amber Bravo, Director of Story Studio, on 29 June 2026. It is organized around three questions: where design really starts, how AI amplifies craft, and who gets to be creative, with contributor pieces from Figma's Brand Studio and leadership. Worth reading for how a product team frames the argument that new tools widen expressive range rather than replace it; the issue was designed by graphic studio No Ideas, printed with three cover variants, and sold through the Figma Store.",
      },
      {
        title: "Path to Design",
        href: "https://www.pathtodesign.com/",
        dateAdded: "2026-07-14",
        description:
          "Platform of real designer career stories across product, UI/UX and graphic design, with 57+ interviews, a career-path quiz, and curated tool/book recommendations. Its 57 designers span over a dozen countries, from Iran to Denmark, paired with a 60-second 'Find Your Design Path' quiz.",
      },
      {
        title: "The World According to Umbra",
        href: "https://arenamag.com/articles/the-world-according-to-umbra",
        dateAdded: "2026-07-14",
        description:
          "Essay from Arena, a magazine covering technology, capitalism and civilization, examining its subject through that lens. Written by Arena founder Maxwell Meyer, it centers on Umbra's 16cm-resolution SAR image of a Honolulu pineapple plantation, sharp enough to count plants.",
      },
      {
        title: "Byrne's Euclid",
        href: "https://c82.net/euclid/",
        dateAdded: "2026-07-14",
        description:
          "Interactive digital reproduction by Nicholas Rougeux of Oliver Byrne's 1847 edition of Euclid's Elements, which replaced algebraic labels with bold colored diagrams, a landmark of information design centuries before the term existed. Beyond the six digitized books, Rougeux sells the diagrams as physical wall posters and jigsaw puzzles, extending the 1847 design into print.",
      },
      {
        title: "Bret Victor references",
        href: "https://worrydream.com/refs/",
        dateAdded: "2026-07-14",
        description:
          "Reference/bibliography page from Bret Victor's site (Worrydream), the influential essayist behind 'Up and Down the Ladder of Abstraction' and 'The Future of Programming', linking the sources behind his thinking. Spans roughly 700 sources from 1828 to 2023, alphabetized by author, including Bush's 'As We May Think' and Sutherland's Sketchpad dissertation.",
      },
      {
        title: "The Cypherpunk Library",
        href: "https://www.cypherpunkbooks.com/",
        dateAdded: "2026-07-14",
        description:
          'Curated collection of texts from cypherpunk and cryptography culture, the writing and manifestos behind the movement that shaped modern encryption and privacy tech. A personal, public-domain-only collection including Phil Zimmermann\'s "Why I Wrote PGP" and the classic "Conscience of a Hacker" text.',
      },
      {
        title: "Design Research: By Womxn",
        href: "https://www.design-research.be/by-womxn",
        dateAdded: "2026-07-14",
        description:
          "Design research project centering women's perspectives and experiences in how design research gets done. Curated by Loraine Furter since 2018, cataloging 100+ free/libre open-source fonts by womxn designers, a sister project to Bye Bye Binary.",
      },
      {
        title: "Playlists.design",
        href: "https://playlists.design",
        dateAdded: "2026-07-14",
        description:
          "Curated music playlists for designers to work to, mood-matched to focused design sessions. Built by Fons Mans with LottieFiles: 16 Spotify playlists from named curators like Erik D. Kennedy, followed by 1,000+ designers.",
      },
      {
        title: "Hey Designer",
        href: "https://heydesigner.com",
        dateAdded: "2026-07-14",
        description:
          "Daily-curated design newsletter running since 2012, hand-picking the week's best design links for over 10,000 subscribers covering design systems, UI/UX principles and new tools. Ships its roundup every Tuesday plus daily link posts, distributed across RSS, LinkedIn, BlueSky, X, and Signal, not just email.",
      },
    ],
  },
  {
    title: "Animation and motion",
    links: [
      {
        title: "Animated blur overlay",
        href: "https://expensive.toys/blog/animated-blur-overlay",
        dateAdded: "2026-09-02",
        kind: "essay",
        stack: ["css", "backdrop-filter", "houdini"],
        useFor: [
          "animate backdrop-filter",
          "backdrop blur animation",
          "modal overlay blur",
          "blur transition",
          "css at-property",
          "chrome blur flicker",
          "animate css variable",
        ],
        description:
          "Walks through animating a backdrop-filter: blur() overlay, the kind that sits behind a modal, around Chrome's refusal to transition it. Chrome flickers when content under the backdrop moves or the backdrop leaves the viewport, and the filter breaks outright when you transition or animate it, so the fix is to register a custom property --overlay-blur with @property (length syntax, inherits: false, initial-value: 0px) and animate that into the blur function instead. Firefox does not support @property, so the snippet branches on @supports (-moz-appearance: none) and transitions backdrop-filter directly there. By Artur Bień, September 7 2023, with a hover-to-play demo and the full CSS to copy; open and closed states are driven by a data-state attribute, no JavaScript.",
      },
      {
        title: "balloons-js",
        href: "https://arturbien.github.io/balloons-js/",
        dateAdded: "2026-09-02",
        kind: "library",
        stack: ["typescript", "svg", "web-animations-api"],
        useFor: [
          "balloon animation",
          "floating balloons",
          "celebration effect",
          "confetti alternative",
          "party effect",
          "birthday animation",
          "easter egg animation",
        ],
        description:
          "Small JavaScript library that releases a burst of floating balloons across the page, for celebration moments and easter eggs where confetti would be the obvious pick. Two exports: balloons() for the default release, and textBalloons(), which takes an array of { text, fontSize, color } and floats arbitrary strings or emoji instead. Each balloon is inline SVG driven by element.animate(), tilted at a random 8 to 15 degrees and cycled through a fixed palette of five two-stop color pairs, with an 8px blur on the nearest layer so the crowd reads as having depth. MIT, version 0.0.3, no runtime dependencies, roughly 518 GitHub stars, by Artur Bień, who also built React95.",
      },
      {
        title: "Theatre.js sequences manual",
        href: "https://www.theatrejs.com/docs/latest/manual/sequences",
        dateAdded: "2026-08-05",
        stack: ["theatre"],
        useFor: [
          "theatre.js",
          "keyframe animation",
          "animation timeline",
          "scrub animation",
          "tween editor",
          "animate three.js",
          "sequence editor",
        ],
        description:
          "Manual page for Theatre.js sequences, the part of the library that turns a prop into a keyframed animation you scrub in a timeline instead of hand-tuning numbers in code. Covers right-clicking a prop to Sequence it (Sequence all on a compound prop, undone with Make static), aggregate keyframes that move a parent's children and their connectors together, the tween editor whose timing functions mirror CSS transition-timing-function down to fuzzy search for quad-in-out and custom cubic Beziers, focus ranges drawn with Shift to loop playback over a section, and the multi-track curve editor. The runtime side is sheet.sequence: play with repeats and direction, pause, position, pointer for watching changes as they happen, and attachAudio. Published by Theatre.js Oy in Helsinki, docs version 0.5, last edited February 1, 2024; the worked example wires a three.js DirectionalLight through types.number with a range of 0 to 30 and syncs back via onValuesChange.",
      },
      {
        title: "Hyperiux Vault",
        href: "https://vault.hyperiux.com/",
        dateAdded: "2026-07-24",
        description:
          "Source-first interaction effects library for React and Next.js: install a component via CLI, then own and customize the code. Built by Hyperiux Studio, a creative frontend agency, with 115 effects (32 free in the Core tier, 83 in Pro) added to monthly, spanning text animations, backgrounds, buttons, carousels, scroll effects, navigation, cursor effects, page transitions, loaders, and WebGL scenes. Built on GSAP, Three.js, Lenis, and WebGL, with reduced-motion support, mobile fallbacks, and commercial-friendly licensing. Free Core is $0 forever; Pro is $20 a month or $179 a year.",
      },
      {
        title: "Penflow",
        href: "https://penflow.cretu.dev/",
        dateAdded: "2026-07-24",
        description:
          'React component that animates text as if a pen were writing it in real time, tracing each glyph\'s outline rather than fading or masking a static string. Built by Cristi Cretu (cristicretu on GitHub), it extracts glyph contours with Typr.js and layers font-aware brush profiles and streaming timing on top, so the stroke follows the actual letterforms of the font you pass. Usage is a single tag: `<Penflow text="hello world" fontUrl="/fonts/BrittanySignature.ttf" />` imported from `penflow/react`. MIT licensed, roughly 110 GitHub stars, shipped as a monorepo with the demo site.',
      },
      {
        title: "Annnimate",
        href: "https://annnimate.com/",
        dateAdded: "2026-07-21",
        description:
          "Library of pre-built GSAP motion components you copy in and tune, for when you need a polished scroll effect or menu without rebuilding it from scratch. Built by Good Fella, a studio that has done motion work for Coca-Cola, BodyArmor, and Powerade, with 62+ components across buttons, scroll effects, menus, sections, and shaders, shipped for React (useGSAP), Vue composables, and plain HTML/CSS/JS, and compatible with Next.js App Router and Nuxt. Each has a live preview and one-click copy in your framework, reduced-motion support, and an MCP server for Cursor and Claude Code. Paid subscription from 29 euro a month with a free weekly starter pack and a one-time Reveal Kit at 149 euro.",
      },
      {
        title: "Fancy CSS Reveal Effects",
        href: "https://expensive.toys/blog/fancy-css-reveal-effects",
        dateAdded: "2026-07-16",
        description:
          "Blog post breaking down fancy CSS reveal effects, walking through the techniques for animating text and content into view on scroll and interaction. By Artur Bien (April 2023): uses the @property at-rule to animate mask gradients across 9 live demos like Iris and Diamond Wipe.",
      },
      {
        title: "MotionSites",
        href: "https://motionsites.ai",
        dateAdded: "2026-07-15",
        description:
          'Collection of AI prompts for creating animated websites and motion-led interface experiences. Runs a freemium model: prompts are free to copy, but exclusive templates and full access require a paid "Go Unlimited" tier.',
      },
      {
        title: "Text Effects by Colorion",
        href: "https://text-effects.colorion.co",
        dateAdded: "2026-07-15",
        description:
          "Gallery of pure CSS text animations that can be studied and adapted without a JavaScript animation library. Ships 66 distinct effects under an MIT license, so every snippet is free to copy and modify without attribution.",
      },
      {
        title: "Kinetics by Colorion",
        href: "https://kinetics.colorion.co",
        dateAdded: "2026-07-15",
        description:
          "Interactive collection of spring-physics UI motion for exploring natural-feeling interface animation. Covers 117 spring-driven interactions and exports each one as CSS, React, or an AI prompt, no Framer Motion dependency.",
      },
      {
        title: "Animations on the Web",
        href: "https://animations.dev/demo",
        dateAdded: "2026-07-14",
        description:
          "Course by Emil Kowalski (creator of Sonner and Vaul) on web animation fundamentals: easing, spring physics, and building interactions that feel right rather than just moving. Structured as hands-on project builds you code alongside, not lecture videos, so you ship real interactive components while learning.",
      },
      {
        title: "Transitions.dev",
        href: "https://transitions.dev/",
        dateAdded: "2026-07-14",
        description:
          "Reference and demo site for view transitions on the web, showing what's possible with the View Transitions API and shared-element route animations. Built solo by developer Jakub Antalik, with demos like card-stack hover, skeleton loaders, and 3D tilt built in plain React and CSS.",
      },
      {
        title: "Ripplix",
        href: "https://www.ripplix.com/",
        dateAdded: "2026-07-14",
        description:
          "Collection of ripple and wave-style interaction effects for web interfaces. Curates 7,000+ real micro-interactions pulled from 1,000+ shipped apps rather than offering pre-built code, with a free tier plus a $5/month Pro plan.",
      },
      {
        title: "Motion Core",
        href: "https://motion-core.dev/",
        dateAdded: "2026-07-14",
        description:
          "Svelte-native motion component library powered by GSAP and WebGL, from subtle text effects to full 3D canvas systems. Built by solo dev Marek Jóźwiak, MIT licensed, with a CLI that installs only the components you pick instead of the whole library.",
      },
      {
        title: "Tailwind CSS Animations",
        href: "https://tailwindcss-animations.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Collection of ready-made CSS animations built to work as Tailwind utility classes, drop-in motion without writing custom keyframes. Ships 79+ MIT-licensed utilities from midudev, now rebuilt for Tailwind v4's CSS-import config with a legacy v3 package kept around.",
      },
      {
        title: "Animista",
        href: "https://animista.net/play/basic/flip/flip-diagonal-2-tl",
        dateAdded: "2026-07-14",
        description:
          "Long-running CSS animation playground: pick an effect, tune its parameters visually, and copy out the generated keyframes and classes. Solo side project by Ana Travas launched back in 2017, still free under the FreeBSD license for both personal and commercial use.",
      },
      {
        title: "Fliiipbook",
        href: "https://www.fliiipbook.com/animate",
        dateAdded: "2026-07-14",
        description:
          "Simple web app for creating frame-by-frame GIF animations, with onion-skinning support and GIF export. Caps each animation at 24 frames (2 seconds looping) and packs 5 brush sizes, a paint bucket, spray tool, and texture fills, no signup needed.",
      },
      {
        title: "Text Motion",
        href: "https://textmotion.dev/",
        dateAdded: "2026-07-14",
        description:
          "Lightweight, dependency-free library (slot-text) for character-by-character rolling text animation, built for tiny, tactile UI labels using pure CSS transforms. Ships as the npm package slot-text, currently v0.3.3, MIT licensed, with a CSS footprint of roughly 1 kB.",
      },
      {
        title: "Spring Physics in CSS",
        href: "https://www.carmenansio.com/articles/spring-physics-css",
        dateAdded: "2026-07-14",
        description:
          "Article explaining how to implement realistic spring-physics motion using plain CSS, without reaching for a JS animation library. Walks through a generator that turns real spring stiffness/damping/mass math into CSS linear() curves, supported since Chrome 113 and Safari 17.2.",
      },
      {
        title: "Anime.js",
        href: "https://animejs.com/",
        dateAdded: "2026-07-14",
        description:
          "Long-standing, widely used lightweight JavaScript animation engine, works across CSS properties, SVG, DOM attributes and JS objects with one consistent API. Built by Julian Garnier and now at v4.0.0, where the full bundle with every optional module included totals 24.50 KB.",
      },
      {
        title: "glimm",
        href: "https://glimm.dev/",
        dateAdded: "2026-07-14",
        description:
          "Lightweight (under 10KB) React/Next.js library for GPU-powered, shader-driven page transitions, a WebGL band sweeps across the screen on route change for meaningful moments rather than every navigation. Made by developer Noman (@nomandsign), currently v0.1.4 with zero runtime dependencies beyond React 18+ and Next.js 13+ as peers.",
      },
      {
        title: "Satteri",
        href: "https://satteri.bruits.org/",
        dateAdded: "2026-07-14",
        description:
          "Rust-based markdown processing pipeline for the JavaScript world, combining a fast Rust markdown engine with flexible JS plugins for processing Markdown and MDX. Distributed as the npm package `satteri` and mirrored on crates.io for its Rust half, maintained under the Bruits project.",
      },
      {
        title: "Lina scroll area",
        href: "https://lina.sameer.sh/",
        dateAdded: "2026-07-14",
        description:
          "Responsive scroll area component that feels native on touch devices: native scrollbars on mobile, custom-styled ones on desktop, with edge masking and polished micro-interactions. Built by Sameer JS as an open-source, drop-in replacement for shadcn/ui's ScrollArea component, source on GitHub (SameerJS6/lina).",
      },
      {
        title: "aMicro",
        href: "https://amicro.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Micro-transitions tool/framework for small-scale UI state-change animations. Open-source (Subhan-code on GitHub), built on Motion, install via one CLI command that copies pure React + Tailwind + Motion code.",
      },
      {
        title: "Kexsio animations",
        href: "https://www.kexsio.com/animations",
        dateAdded: "2026-07-14",
        description:
          "Gallery of production-ready web components and animation templates with a copy-paste-build workflow, browsable by category with AI prompts or source code for each. Spans a dozen categories, from 3D Effects and Text Effects to Testimonials and Footers, with a load-more gallery beyond the initial grid.",
      },
      {
        title: "Motionary",
        href: "https://motionary.dev/creators/6949b8263085772eb831634a",
        dateAdded: "2026-07-14",
        description:
          "Marketplace for premium animation and interactive UI components specifically for React Native and Expo apps, from common free effects to paid, more elaborate ones. Creator mehdi_made lists 50+ components tiered Rare ($3-7) and Legendary ($9-12), plus a $56 lifetime-access bundle for the full catalog.",
      },
      {
        title: "Reactiive demos",
        href: "https://reactiive.io/demos",
        dateAdded: "2026-07-14",
        description:
          "Gallery of creative React animation demos for interaction and motion inspiration. Made by Enzo Manuel Mangano; open-sourced in 2024 as 100+ React Native (not web) demos built with Reanimated, Gesture Handler, and Skia.",
      },
      {
        title: "ssgoi",
        href: "https://ssgoi.dev",
        dateAdded: "2026-07-14",
        description:
          "Page transition library for single-page apps, for animating between routes instead of hard page cuts. Ships one shared transition API across six frameworks (React, Svelte, Vue, Solid, Angular, Qwik) rather than locking you into one.",
      },
      {
        title: "React Native Reanimated",
        href: "https://github.com/software-mansion/react-native-reanimated",
        dateAdded: "2026-07-15",
        description:
          "Software Mansion's animation library that runs animation logic on the UI thread via worklets; Meta's core team is now collaborating on a shared animation backend landing in React Native itself. Reanimated 3 rewrote animations for React Native's New Architecture, letting shared values drive Fabric's UI thread with no JS bridge round-trip.",
      },
    ],
  },
  {
    title: "WebGL, shaders and creative coding",
    links: [
      {
        title: "Murmur for the web",
        href: "https://murmur.krispuckett.com/",
        dateAdded: "2026-09-02",
        kind: "library",
        stack: ["webgpu", "webgl", "wgsl", "typescript", "vgpu"],
        useFor: [
          "ai presence orb",
          "voice orb",
          "thinking indicator",
          "webgpu glass",
          "agent status animation",
          "shader presence",
          "murmur web",
        ],
        style: "liquid-glass",
        description:
          "Responsive AI presence orbs for the web, useful when an agent, voice UI or token stream needs a visible state instead of a spinner. Kris Puckett ported the Murmur SwiftUI glass presences from Metal to WebGPU with WebGL2 fallback, using the same math and 18 species across six states: idle, listening, thinking, responding, success and error. Each species is designed at 120 pt, 46 pt and 18 pt sizes, supports live voice and activity signals, pointer or gyro parallax, duotone and light mode, and is MIT licensed with one runtime dependency, vgpu. The README says it is not on npm yet, so install vgpu and copy the source or build the ESM bundle.",
      },
      {
        title: "Fayaaa",
        href: "https://github.com/Xblueprintlab/fayaaa",
        dateAdded: "2026-08-31",
        kind: "tool",
        stack: ["webgpu", "wgsl", "typescript", "vite", "shaders"],
        useFor: [
          "fire shader",
          "burning effect",
          "image to fire",
          "text on fire",
          "webgpu playground",
          "wgsl fire",
          "jump flooding",
          "signed distance field",
        ],
        description:
          "Shape-aware WebGPU playground that turns an uploaded image, typed text, or a sample mark into animated fire, MIT from the Blueprint Lab org and running at blueprintlab.work/fayaaa/. Two treatments: burn through makes the subject itself the fire material, burn around keeps the image core visible and sends flame along its boundary. The pipeline is mask inference, anti-aliased jump flooding, a signed distance field, then the WGSL material in src/shaders/fayaaa.wgsl, sampled inside WebGPU so output stays one coherent render instead of stacked DOM layers. Controls cover direction, intensity, spread, inside glow, sharpness and motion, with 5 blend modes, 3 palettes, PNG export and MP4 or WebM export in 4 aspect ratios at 24, 30 or 60 FPS. Uploads never leave the browser. TypeScript and Vite, GPU-backed test and check scripts alongside the plain ones, about 6 stars and only 2 commits as of August 2026.",
      },
      {
        title: "ThreeUI",
        href: "https://threeui.com/browse",
        dateAdded: "2026-08-29",
        kind: ["library", "directory"],
        stack: ["three", "webgl", "react", "shaders"],
        useFor: [
          "three.js components",
          "webgl hero section",
          "copy paste three.js",
          "shader buttons",
          "3d landing template",
          "interactive shaders",
        ],
        description:
          "Catalog of copy-ready Three.js components, landing templates and interactive shaders by Meng To / Design+Code, browsed live at /browse. Community edition is login-free: 50 parent components, 111 routes, 164 browse results (141 free variants plus 23 singletons), MIT application and community source. npm package is @designcodeio/threeui. Named families on the grid include Sylva, Sketchbook, Kage, Predictive Arc, Structure Flow, Landscape (noon through snow), Shader Buttons and Liquid Metal Button, with Pro and Beta variants gated. GitHub MengTo/threeui, about 4.4k stars.",
      },
      {
        title: "Ink on paper (vgpu)",
        href: "https://immense-jaguar-8615.edgespark.app/api/public/s/vgpu-ink/",
        dateAdded: "2026-08-29",
        kind: "demo",
        stack: ["webgpu", "vgpu", "shaders"],
        useFor: [
          "vgpu demo",
          "webgpu ink",
          "fluid paint shader",
          "drag to paint",
          "headless webgpu render",
        ],
        description:
          "Public EdgeSpark demo of a fluid ink solver running on vgpu: hold and drag, each stroke a different pigment, reset to start over. Title on the page is Ink on paper. Browsers without WebGPU get a headless Node render of the same shader as video. Chrome or Edge 113+ and Safari 26 can paint live. Use it as a working vgpu example, not as the library docs.",
      },
      {
        title: "vgpu",
        href: "https://vgpu.sh/",
        dateAdded: "2026-08-29",
        kind: "library",
        stack: ["webgpu", "typescript", "wgsl", "mcp", "cli"],
        useFor: [
          "webgpu library",
          "typed wgsl imports",
          "headless webgpu",
          "shader for agents",
          "npx vgpu",
          "gpu in ci",
        ],
        description:
          "TypeScript WebGPU library from Vercel Labs, aimed at agents as much as humans: one Gpu handle, typed .wgsl imports, the same shader in a browser canvas, headless Node (Dawn) and a mock adapter for CI. A complete fullscreen effect is budgeted at 25 KB gzipped, enforced in CI. Install with pnpm add vgpu, browse examples with npx vgpu examples, or point an agent at the hosted MCP on /api/mcp plus llms.txt. MIT, vercel-labs/vgpu, published on npm.",
      },
      {
        title: "Infinite Liquid Glass",
        href: "https://infinite-liquid-glass.shader.se/?v=2",
        dateAdded: "2026-08-19",
        kind: "demo",
        stack: ["webgpu", "shaders"],
        useFor: [
          "liquid glass shader",
          "refraction effect",
          "webgpu demo",
          "glass distortion",
          "shader studio work",
        ],
        style: ["liquid-glass", "maximalist"],
        description:
          "WebGPU liquid glass experiment by Shader (shader.se), a studio that does shader development as client work. The page is a loader-gated full-screen demo with no write-up, controls list or source link, so treat it as a reference for the look rather than a technique to read; the site's own contact route is a booking link. WebGPU means a Chromium browser or Safari 26+, not a guaranteed render everywhere.",
      },
      {
        title: "codrops-relightning-images",
        href: "https://github.com/DGFX/codrops-relightning-images",
        dateAdded: "2026-08-19",
        kind: "demo",
        stack: ["three", "tsl", "webgpu", "vite"],
        useFor: [
          "relight a photo",
          "depth map lighting",
          "2d image 3d lighting",
          "fake normals from depth",
          "self shadowing image",
        ],
        description:
          "Source for the Codrops tutorial on relighting flat 2D images, by Dominik Fojcik (DGFX). A depth map drives surface detail and self-shadowing so a photograph reacts to a moving light as if it were 3D geometry, built with Three.js TSL on the WebGPU renderer and served through Vite. Three demo variants ship in the repo (index, demo2, demo3), and the depth maps come from Depth Anything 3 by way of the author's own generator at depth.fojcikdominik.com. npm install then npm run dev, MIT, live demo on tympanus.net.",
      },
      {
        title: "Shading Motion",
        href: "https://blog.maximeheckel.com/posts/shading-motion/",
        dateAdded: "2026-08-19",
        kind: "essay",
        stack: ["webgpu", "wgsl", "three", "tsl", "react-three-fiber"],
        useFor: [
          "motion detection shader",
          "optical flow",
          "frame differencing",
          "blob tracking",
          "motion blur",
          "velocity map",
          "compute shader video",
        ],
        description:
          "Maxime Heckel on treating motion, not color or depth, as the shader input, published August 2026 after two months of TouchDesigner-inspired experiments. Four techniques, each with WGSL and a live playground: frame differencing through a luma dot product and a smoothstep threshold plus a decaying trail buffer, blob tracking that packs 12 blobs as vec4f in a storage buffer and draws them with SDFs, optical flow that encodes direction in the G and B channels of an rgba8unorm texture and renders it as a grid of arrows, and per-object motion blur from a velocity map rendered through an offscreen React Three Fiber portal. Closes on wagon-wheel aliasing and Pierre Cusa's raised-cosine shutter fix. The compute path uses ping-pong storage textures, so it does not run on Safari.",
      },
      {
        title: "Motion GPU",
        href: "https://motion-gpu.dev/",
        dateAdded: "2026-08-14",
        kind: "library",
        stack: ["webgpu", "wgsl", "react", "svelte", "vue"],
        useFor: [
          "webgpu shader",
          "wgsl shader",
          "fullscreen fragment shader",
          "gpu compute",
          "feedback pass",
          "feedback effects",
          "post processing pass",
          "shader in react",
          "procedural textures",
        ],
        description:
          "WebGPU runtime for fullscreen WGSL shaders, for shader-driven visuals, generative art, procedural textures, post processing and GPU compute without pulling in a 3D engine. Ships as one package, @motion-core/motion-gpu, with a framework-neutral core plus /svelte, /react and /vue entrypoints (each with an /advanced variant); React 19, Svelte 5.29 and Vue 3.5 are optional peers and @webgpu/types is the only hard dependency. Covers validated WGSL materials, runtime updates to uniforms, textures and storage buffers, render, feedback and compute passes, an explicit scheduler with render modes, and WebGPU failures normalized into reports carrying source snippets and hints. It owns the canvas, render loop and GPU resources while your app owns the shaders and interaction, and it needs WebGPU in a secure context such as HTTPS or localhost; MIT from the motion-core org, 180 stars, v0.15.0 published 13 August 2026, with docs and a browser playground on the same site.",
      },
      {
        title: "Geom (Kynd)",
        href: "https://www.kynd.info/geom/",
        dateAdded: "2026-08-14",
        kind: "essay",
        stack: ["audio", "generative"],
        useFor: [
          "sound reactive shapes",
          "audio reactive visuals",
          "parametric shapes",
          "generative geometry",
          "music video visuals",
          "fourier transform",
          "animation without keyframes",
          "math driven motion",
        ],
        description:
          "Sketchbook and working log for a music video built entirely out of math, worth reading when you want geometry driven by sound rather than by hand-authored keyframes. By Kenichi Yoneda (Kynd), made for the album Musical Architecture by Yaporigami (Yu Miyashita), it runs as nine chapters: sound analysis, parametric shapes, lighting and rendering, sound-reactive environment, sound-reactive shapes, multitrack visualization, effects and refinements, composition and an appendix. Three self-imposed rules shape the whole thing: only deterministic fundamental functions such as polynomials and trigonometry with no hand-built geometry, identical output for identical sound input with no random or noise functions so the audio stays the only quasi-random element, and avoiding keyframing wherever possible, which the author concedes is nearly impossible to follow strictly. Concepts such as Bezier curves, Fourier transform and sine wave decomposition link out to separate essays on kynd.info; source is at github.com/kynd/geom, with writing and code under CC BY-SA 4.0 and the finished piece under CC BY-NC-SA 4.0.",
      },
      {
        title: "Jungle Cursor Canopy (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/jungle-cursor-canopy",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["three", "gsap"],
        useFor: [
          "procedural foliage",
          "cursor parts leaves",
          "generative canopy",
          "gsap camera sequence",
          "depth of field particles",
        ],
        description:
          "Dense procedural jungle canopy that parts around the cursor, then lifts and spirals past the camera in a GSAP-choreographed landing sequence. Three.js leaves combine generated species silhouettes, physical materials, spatial gusts, depth of field and a configurable field of glowing air motes. From the Whitespace playground, 16 July 2026.",
      },
      {
        title: "Pendant Lamp (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/pendant-lamp",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f", "webgl"],
        useFor: [
          "light reveals page",
          "pendulum physics",
          "spotlight mask",
          "halftone crt filter",
          "interactive lamp",
          "dark until lit",
        ],
        description:
          "Pendant lamp on a real pendulum that physically lights an HTML page rendered into WebGL through html-in-canvas. Outside the beam the page falls dark, running dim grayscale with blur, stroked outline, halftone, CRT and dither, and the swinging light reveals the true page. Grab and throw the lamp, or hover a button and the beam aims at it. From the Whitespace playground, 14 July 2026.",
      },
      {
        title: "Twisting Ribbons (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/twisting-ribbons",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "twisting ribbons",
          "material blend band",
          "vesica negative space",
          "staggered twist",
          "ribbon geometry",
        ],
        description:
          "Row of thin vertical ribbons twisting around their Y axis, progressing from edge-on at the left to face-on and past it at the right. A twist band blends two materials top to bottom, and the negative space between neighbors forms vesica-shaped voids. From the Whitespace playground, 16 May 2026.",
      },
      {
        title: "Devtools Demo (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/devtools-demo",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "r3f devtools",
          "scene edit mode",
          "light rig helper",
          "copy values gizmo",
          "three.js tooling",
        ],
        description:
          "Reference scene exercising every r3f-devtools helper the Whitespace playground is built on: ExperimentCanvas, DialLightRig, DialCamera, useDialPhysicalMaterial and useDialTween, plus edit-mode wireframe, helpers, orbit, gizmo and copy-values. Read this one for the tooling behind the other experiments rather than for an effect. Dated 4 May 2026.",
      },
      {
        title: "Glass Hero (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/glass-hero",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "glass refraction",
          "dispersion material",
          "chromatic fringe",
          "glass over html",
          "ior and thickness",
          "refracting hero",
        ],
        description:
          "Live HTML hero section sitting behind floating glass shapes that refract and split light into chromatic fringes, with real-time dispersion through MeshPhysicalMaterial. Drag to reposition the glass and tune IOR, thickness and dispersion in DialKit. From the Whitespace playground, 1 May 2026.",
      },
      {
        title: "Shader Deck (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/shader-deck",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "3d carousel ring",
          "portal transition",
          "volumetric light",
          "bloom and chromatic aberration",
          "slide deck in 3d",
        ],
        description:
          "3D carousel of HTML slides arranged on a ring, scrolling through a glowing portal plane with volumetric light, fog, bloom and chromatic aberration. Built with R3F, drei and html-in-canvas. From the Whitespace playground, 26 April 2026.",
      },
      {
        title: "Code Slice Hero (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/code-slice-hero",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["react", "three", "r3f"],
        useFor: [
          "page shatter",
          "tile grid transition",
          "hero reveal",
          "slice effect",
          "landing page transition",
        ],
        description:
          "Landing page that hovers, lifts and shatters into a grid of tiles to reveal an agent surface document and a working terminal underneath. From the Whitespace playground, 23 April 2026, built with three.js, R3F and html-in-canvas.",
      },
      {
        title: "Particle Phones (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/particle-phones",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "particles form image",
          "scroll triggered particles",
          "particle resolve",
          "sticky column scroll",
          "image dissolve",
        ],
        description:
          "Three-column scroll page whose middle column holds a cloud of particles in organic drift, resolving crisply into a phone screenshot as each new section headline arrives. From the Whitespace playground, 20 April 2026.",
      },
      {
        title: "Mobius Strip (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/mobius-strip",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas", "webgl"],
        useFor: [
          "mobius strip",
          "page on geometry",
          "scroll rotates mesh",
          "html mapped to 3d",
          "curved page",
        ],
        description:
          "HTML landing page mapped onto a 3D Mobius strip with html-in-canvas, where scrolling rotates the strip and traverses the page content. From the Whitespace playground, 13 April 2026.",
      },
      {
        title: "Shader Cards (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/shader-cards",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas", "webgl"],
        useFor: [
          "particles collide with text",
          "luminance collision map",
          "rain over page",
          "effects over html",
          "scrollable canvas page",
        ],
        description:
          "Scrollable HTML rendered into canvas with particles that rain down and collide with page elements using a luminance-based collision map. From the Whitespace playground, 11 April 2026.",
      },
      {
        title: "HTML in Canvas (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/html-in-canvas",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas", "webgl"],
        useFor: [
          "drawelementimage",
          "html into canvas",
          "wicg api",
          "dom in webgl",
          "canvas page effects",
        ],
        description:
          "Demo of rendering real, interactive HTML into canvas through the experimental WICG drawElementImage API, then running wave, kaleidoscope, shatter, melt, glitch and WebGL shader effects over it. From the Whitespace playground, 10 April 2026, and the technique most of the later experiments there are built on.",
      },
      {
        title: "Viewport Transition (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/viewport-transition",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["three"],
        useFor: [
          "2d to 3d transition",
          "wireframe scene",
          "extruded text",
          "page becomes scene",
          "immersive transition",
        ],
        description:
          "A 2D marketing page that transforms into an immersive 3D wireframe scene with extruded text, bloom and chromatic aberration. From the Whitespace playground, 2 April 2026.",
      },
      {
        title: "Neural Burst (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/neural-burst",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "3d node graph",
          "radial graph",
          "network visualization",
          "expandable nodes",
          "data viz canvas",
        ],
        description:
          "3D radial node graph with labeled endpoints where nodes flow and rotate in space, hover inspects one and clicking expands a detail panel. From the Whitespace playground, 29 March 2026, and the only data-visualization piece there.",
      },
      {
        title: "Morph Blob (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/morph-blob",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["canvas"],
        useFor: [
          "morphing blobs",
          "perlin noise shape",
          "organic blob",
          "attract and repel",
          "blob merge",
        ],
        description:
          "Organic blobs that morph with Perlin noise and drift on their own, deforming and merging when you hover to attract or repel them. From the Whitespace playground, 29 March 2026.",
      },
      {
        title: "Microchip Viewer (Whitespace)",
        href: "https://experiments.thisiswhitespace.com/microchip-viewer",
        dateAdded: "2026-08-10",
        kind: "demo",
        stack: ["three"],
        useFor: [
          "3d product viewer",
          "exploded view",
          "togglable parts",
          "tone mapping controls",
          "hardware viewer",
        ],
        description:
          "Interactive 3D microchip prototype with togglable parts, configurable lighting and tone mapping controls. One of the two oldest experiments on the Whitespace playground, 27 March 2026, and the base for its Product Card application, which embeds the chip in a card that explodes on click.",
      },
      {
        title: "Experiments in procedural dappled light shaders",
        href: "https://jzhao.xyz/posts/dappled-light",
        dateAdded: "2026-08-07",
        kind: "essay",
        stack: ["shaders", "canvas"],
        useFor: [
          "dappled light",
          "procedural light shader",
          "komorebi shader",
          "l-system tree",
          "tree shader",
          "site lighting effect",
          "penumbra shader",
          "dithered light",
        ],
        description:
          "Write-up by Jacky Zhao on rebuilding the lighting of jzhao.xyz as a procedural dappled-light scene, after a Chrome zoom compositing bug forced him to drop his earlier open-source CSS Sunlit effect. Posted 2026-08-02 as a 33-minute technical essay walking from multi-octave thresholded Perlin noise and Bayer dithering on a low-resolution pixelated canvas, through a warm gold fringe painted only on mid-tone sharp gradients, to probabilistic L-system trees with da Vinci branch-area conservation and golden-angle phyllotaxis when pure fragment-shader noise and Voronoi edges failed as branches. Depth comes from penumbral blur by focal distance plus a leaf-layer threshold gradient, with mouse parallax by depth; the page embeds reseed and reshuffle controls. Framed as making a personal site feel like a digital home with komorebi (sunlight through leaves), citing Katherine, Henry and Michael's sites as references.",
      },
      {
        title: "junkiyoshi",
        href: "https://junkiyoshi.com/",
        dateAdded: "2026-08-05",
        kind: "demo",
        stack: ["openframeworks", "cpp", "creative-coding"],
        useFor: [
          "openframeworks examples",
          "creative coding sketches",
          "generative art source code",
          "daily sketch blog",
          "generative geometry",
          "c++ creative coding",
          "perlin noise sketches",
        ],
        description:
          "Daily creative coding sketch blog, titled Doodling with Programming, where every post ships the full openFrameworks source next to the animation, so a sketch you like is immediately readable rather than only watchable. Run by junkiyoshi in C++ rather than a browser sketch stack, one post a day across 1,078 pages of archive at three posts a page, still publishing. Each entry is rigidly templated: an embedded video, a one-line description in Japanese, complete ofApp.h and ofApp.cpp listings, and a GitHub permalink pinned to the exact commit in junkiyoshi/DoodleDeProgramming. The sketches share a house style worth studying on its own, with ofNoise driving parameters, ofEasyCam for 3D, torus and ring geometry assembled by hand into ofMesh with wireframe overlays, and a palette pinned to 39 and 239, near-black and near-white; the number 39 recurs everywhere, including the fixed ofSeedRandom(39) that keeps each piece reproducible.",
      },
      {
        title: "Unicorn Studio Inspiration",
        href: "https://www.unicorn.studio/inspiration",
        dateAdded: "2026-08-05",
        useFor: [
          "unicorn studio",
          "no code webgl",
          "shader inspiration",
          "webgl without glsl",
          "framer webgl",
          "embed a shader",
          "webgl scene reference",
        ],
        description:
          "Gallery of scenes built in Unicorn Studio, the no-code WebGL editor, for seeing what shader work looks like in a real layout before writing any GLSL. Unicorn Studio is a bootstrapped one-person product by George Hastings, previously at AREA 17 and IDEO and the maker of Khroma, who dates the idea to finding The Book of Shaders in October 2020; the editor stacks layers where each layer is a shader pass, driven by scroll, hover, cursor or element appearance, then publishes an embed for Framer, Webflow or a custom site. Free covers all 75+ effects with 8 branded publishes and personal use only, while Legend at $168 a year or $20 monthly adds a commercial license, JSON export, custom 3D models and fonts, versioning and 200 monthly Unicorn AI credits during the open beta. The gallery renders client-side with nothing in the static HTML, and community scenes circulate as remix links that open the whole project file, layer stack and effect settings included.",
      },
      {
        title: "InkField",
        href: "https://ileivoivm.github.io/inkField/",
        dateAdded: "2026-07-24",
        description:
          "Digital ink painting system built on WebGL and p5.js that records every brushstroke as JSON, its path, speed, and direction, then replays the gesture sequence as time-based generative art rather than a flat image. Made by ileivoivm; brush modes carry Chinese labels (飛, 壓, 麥, 鹽, 染, 毛) and stack with metallic fills, flow patterns, and post-processing passes like cellular noise, fBM, grain, and distortion. A public gallery lets people and AI agents load, fork, and repaint each other's recordings, with each fork pointing back to its source so the lineage forms a visible tree. Copyright stays with the painter, and the author plans to open-source it once active maintenance ends.",
      },
      {
        title: "Dissolve",
        href: "https://www.anirudh.info/dissolve",
        dateAdded: "2026-07-23",
        description:
          "Single-page interactive study of a dissolve effect built with SVG filters, useful as a reference for recreating disintegration and fade-to-grain transitions in the browser without reaching for WebGL. Built by Anirudh Pareek (@AnirudhP), a product designer for crypto and internet-native startups, as one of his coding experiments. The page is the live demo itself rather than a write-up, so read the source for the SVG filter setup.",
      },
      {
        title: "No Code-Shader",
        href: "https://the-nocodeshader.hardikbhansali.com/library",
        dateAdded: "2026-07-20",
        description:
          "Library of WebGL shader templates built by Hardik Bhansali entirely in Unicorn Studio, so every effect is remixable without writing GLSL. Browse by animation and visual style tags, bookmark templates, then click through to remix one in the Unicorn Studio community dashboard and drop it into a project. Desktop only, with a request form for commissioned effects. Picked up an Awwwards Honorable Mention.",
      },
      {
        title: "WebGPU.com",
        href: "https://www.webgpu.com/",
        dateAdded: "2026-07-20",
        description:
          "Independent community hub for WebGL and WebGPU, unaffiliated with Khronos or the W3C. Runs a curated showcase of browser GPU work (particle cursors that turn images into shader fields, distributed browser inference clusters, physics accurate snooker sims, drivable F1 model kits) alongside a news feed tracking Chrome WebGPU releases and web platform graphics milestones. Community submissions are open.",
      },
      {
        title: "Redraw: chromatic aberration",
        href: "https://wcandillon.github.io/redraw/examples/example/chromatic-aberration",
        dateAdded: "2026-07-19",
        description:
          "Chromatic aberration example from Redraw, William Candillon's GPU accelerated vector graphics system built on WebGPU. Stroke widths, colors and effects are plain TypeScript functions compiled to run on the GPU, enabling geometry aware strokes, color along a path, vector feathering without rasterization, and shape operators that rasterize as a single shape.",
      },
      {
        title: "Fleet",
        href: "https://tol.is/fleet",
        dateAdded: "2026-07-16",
        description:
          "Interactive flock dynamics experiment by Tolis, simulating boids-style flocking behaviour in the browser where many agents steer, align and swarm in real time. Implements Craig Reynolds' 1986 boids rules (separation, alignment, cohesion), the same algorithm behind Batman Returns' bat swarm and countless nature docs.",
      },
      {
        title: "Matter.js",
        href: "https://brm.io/matter-js/",
        dateAdded: "2026-07-18",
        description:
          "Open-source 2D rigid-body physics engine for the web, with browser demos and guides for simulations, games and interaction experiments. Built solo by Liam Brummitt (liabru); handles collisions in three passes, broad, mid, and narrow-phase, before resolving restitution and friction.",
      },
      {
        title: "Keramos",
        href: "https://keramos.vercel.app/",
        dateAdded: "2026-07-16",
        description:
          "Minimal browser-based creative coding experiment with a monospace control UI, worth a look for its restrained interface and interactive feel. So sparse it's better read as a one-file reference for building your own monospace control panel than adopted as a library.",
      },
      {
        title: "Valessa",
        href: "https://valessa.riotters.com",
        dateAdded: "2026-07-15",
        description:
          "Browser-based 3D product visualizer for exploring interactive product presentation and real-time rendering. Runs entirely client-side over WebGL, so shoppers rotate, zoom, and swap materials on a product with no app or plugin install.",
      },
      {
        title: "The Book of Shaders",
        href: "https://thebookofshaders.com/06/",
        dateAdded: "2026-07-14",
        description:
          "The canonical, widely used interactive guide to GLSL fragment shaders by Patricio Gonzalez Vivo, teaching shader programming from first principles with live, editable examples. Chapter 6 specifically covers swizzling, mix() and step(), and converting RGB to HSB via polar coordinates to build a color wheel.",
      },
      {
        title: "Drei AsciiRenderer",
        href: "https://drei.docs.pmnd.rs/abstractions/ascii-renderer",
        dateAdded: "2026-07-14",
        description:
          "ASCII-art post-processing effect from Drei, the popular helper library for React Three Fiber, rendering a 3D scene as live ASCII characters. Wraps Three.js's built-in AsciiEffect directly, exposing a tunable resolution prop (default 0.15) and a customizable character ramp string.",
      },
      {
        title: "GLSL Sandbox",
        href: "https://mrdoob.com/#/139/glsl_sandbox",
        dateAdded: "2026-07-14",
        description:
          "Long-running community sandbox by mrdoob (Three.js creator) for writing and sharing GLSL shaders live in the browser. Built by Ricardo Cabello (mrdoob), the same author as Three.js, and running continuously since around 2011, predating most shader-toy-style sites.",
      },
      {
        title: "Chrome Experiments",
        href: "https://experiments.withgoogle.com/collection/chrome",
        dateAdded: "2026-07-14",
        description:
          "Google's showcase of creative web experiments pushing browser capabilities, WebGL, audio, and interaction demos from the early Chrome era onward. Launched in 2009 by Google's Chrome team and Creative Lab to prove HTML5/WebGL performance, before broadening into AI and AR experiments.",
      },
      {
        title: "Fluid pendant",
        href: "https://mitxela.com/projects/fluid-pendant",
        dateAdded: "2026-07-14",
        description:
          "Handmade jewelry project by mitxela: a gold-plated pendant with a tiny LED matrix running a real-time FLIP fluid simulation on an STM32 microcontroller, motion-activated and coin-cell powered. Built on an STM32L432KC Cortex-M4, it drives a 216-LED charlieplexed matrix over just 16 GPIO pins and runs about ten hours per LiR2450 charge.",
      },
      {
        title: "Floor796",
        href: "https://floor796.com/#wandering",
        dateAdded: "2026-07-14",
        description:
          "Interactive isometric illustration of an office building where every window reveals an animated vignette, a well-known example of large-scale, detailed 2D animation on the web. Made by Belarusian programmer Pavel Sannikau (0x00), who spent the whole first year of the 2018 project building a custom animation engine before drawing anything.",
      },
      {
        title: "Heerich",
        href: "https://meodai.github.io/heerich/",
        dateAdded: "2026-07-14",
        description:
          "Tiny engine by meodai for building 3D voxel scenes and rendering them as SVG, DOM-integrated so scenes can be styled with CSS and scale infinitely, inspired by sculptor Erwin Heerich's geometric forms. Ships as a single zero-dependency file exporting one Heerich class, with CSG-style boolean operations to cut and combine voxel shapes before export.",
      },
      {
        title: "Whitespace Experiments",
        href: "https://experiments.thisiswhitespace.com/",
        dateAdded: "2026-07-14",
        kind: ["demo", "gallery"],
        stack: ["react", "next", "three", "r3f", "webgl", "canvas", "shaders"],
        useFor: [
          "creative coding playground",
          "r3f experiments",
          "three.js experiments",
          "interaction experiments",
          "webgl demo gallery",
          "html in canvas",
          "studio playground",
          "live parameter controls",
        ],
        description:
          "Playground of 30 interaction experiments from design studio Whitespace, hosted on its own subdomain apart from the client portfolio, so these read as raw technical explorations rather than polished case-study work. Most are built on React Three Fiber and three.js, with a canvas and WebGL shader strand alongside, and many expose a live parameter panel (their in-house DialKit) for retuning each piece in the browser. Dated 27 March to 7 August 2026, with Glass Hero for dispersion, HTML in Canvas, Pendant Lamp physics and Jungle Cursor Canopy among the highlights. Several experiments also carry productized applications, for example Elastic Bars becoming Feature Cards and an Elastic Dropdown.",
      },
      {
        title: "Shaders hero section",
        href: "https://v0.app/templates/shaders-hero-section-cJOO8mnVR01?ref=Z0HBR4",
        dateAdded: "2026-07-14",
        description:
          "v0 template for a shader-driven animated hero section, ready to remix or drop into a project. Runs on WebGPU rather than Three.js or CSS, built by creator simon-at-shaders and already remixed 56 times by other v0 builders.",
      },
      {
        title: "Cells to Pixels",
        href: "https://cells2pixels.github.io/#growing",
        dateAdded: "2026-07-14",
        description:
          "Research project on Neural Cellular Automata: a coarse self-organizing grid paired with a lightweight decoder network generates high-resolution textures and patterns in real time, across 2D/3D grids and mesh surfaces. SIGGRAPH 2026 paper by EPFL and Google Research (Pajouheshgar, Mordvintsev, Süsstrunk et al.) using a Local Pattern Producing Network decoder for arbitrary-resolution rendering.",
      },
      {
        title: "Awwwards WebGL and HTML course",
        href: "https://www.awwwards.com/academy/course/merging-webgl-and-html-worlds/lectures/7a14a7a1-72fe-428c-b5c1-680d7b90c026",
        dateAdded: "2026-07-14",
        description:
          "Awwwards Academy course on blending WebGL scenes with regular HTML/DOM content in the same page. This specific lecture drills into syncing scroll-driven DOM element positions with a live WebGL canvas layer, the trickiest part of hybrid pages.",
      },
      {
        title: "Awwwards interactive 3D scenes course",
        href: "https://www.awwwards.com/academy/course/the-fun-process-of-creating-lively-interactive-3d-scenes-for-the-web/lectures/d84661d2-bc8d-4a55-9928-280aba8b92b2",
        dateAdded: "2026-07-14",
        description:
          "Awwwards Academy course on building lively, interactive 3D scenes for the web from start to finish. This lecture frames 3D scene-building as rapid, playful prototyping rather than production polish, best for the ideation stage of an interaction idea.",
      },
      {
        title: "FluidCAD",
        href: "https://fluidcad.io",
        dateAdded: "2026-07-14",
        description:
          "Parametric CAD tool where you write JavaScript and see 3D geometry update live. Supports sketching, extrusions and fillets, STEP import/export, and keeps a parametric history so earlier steps stay editable. Install is one command (npm i fluidcad); its open-source Smart Defaults auto-picks the last sketch/selection and auto-fuses touching shapes to cut boilerplate.",
      },
      {
        title: "Pascal Editor",
        href: "https://editor.pascal.app",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source, browser-based 3D building editor for turning physical spaces into digital twins, aimed at architects, developers and homeowners alike. MIT-licensed with 17.5K GitHub stars across its viewer/editor/core packages, and ships an MCP server so AI agents can read and reshape scenes programmatically.",
      },
      {
        title: "Halftone Waves",
        href: "https://halftone-waves.ctate.dev",
        dateAdded: "2026-07-15",
        description:
          "Canvas-based generative art piece rendering an animated halftone dot pattern as flowing waves, by Vercel engineer Chris Tate (ctate.dev). Built entirely with Vercel's v0.dev AI generator and shipped as a minimal single-page Next.js bundle, pure 2D Canvas with no extra rendering library.",
      },
      {
        title: "Neon Maze",
        href: "https://neon-maze.ctate.dev",
        dateAdded: "2026-07-15",
        description:
          "Isometric maze rendered in glowing neon colors, a small creative-coding demo by Chris Tate (ctate.dev). Also generated end-to-end through v0.dev, sharing the same lean single-canvas Next.js bundle structure as its sibling ctate.dev demos.",
      },
      {
        title: "Tetrahedron Physics",
        href: "https://tetrahedron-physics.ctate.dev",
        dateAdded: "2026-07-15",
        description:
          "Real-time 3D physics simulation of balls bouncing inside a rotating tetrahedron, by Chris Tate (ctate.dev). Loads roughly double the JS chunks of the other ctate.dev demos, evidence it bundles an actual 3D/physics library rather than hand-rolled math.",
      },
      {
        title: "Audio Visualizer template",
        href: "https://v0.app/templates/audio-visualizer-eGfAJ9Uw70W",
        dateAdded: "2026-07-15",
        description:
          "v0 template for an audio-reactive visualizer, ready to remix or drop into a project. Made by v0 creator ctate, this template has drawn 65 likes and 27 remixes and was last refreshed September 10, 2025.",
      },
    ],
  },
  {
    title: "Audio, video and media",
    links: [
      {
        title: "Rescript",
        href: "https://www.getrescript.com/",
        dateAdded: "2026-09-02",
        kind: "tool",
        stack: ["whisper", "webgpu", "wasm", "ffmpeg", "onnx"],
        useFor: [
          "transcript video editor",
          "edit video by text",
          "remove filler words",
          "on device transcription",
          "voice clone",
          "podcast editing",
          "cut silences",
        ],
        description:
          "Video and audio editor where the transcript is the timeline: delete a word and the footage under it goes with it. Built by wassgha, it transcribes on device with Whisper through WebGPU (WASM fallback), separates speakers with pyannote-segmentation-3.0, and exports via ffmpeg.wasm to MP4, WebM, M4A, MP3, WAV, SRT, VTT and Markdown. The Regenerate feature re-synthesizes a rewritten line in the speaker's own voice, cloned from roughly ten seconds of audio already in the file, across six languages. Runs in a Chromium browser or as a macOS, Windows and Linux desktop build with no account and no upload, under PolyForm Noncommercial 1.0.0, so commercial use needs a paid license.",
      },
      {
        title: "Procedural Sounds",
        href: "https://procedural-sounds.vercel.app/",
        dateAdded: "2026-08-18",
        kind: "tool",
        stack: ["web-audio"],
        useFor: [
          "ui sound effects",
          "interface sounds",
          "click sound",
          "hover sound",
          "web audio synthesis",
          "generate sound effects",
        ],
        description:
          "Generates interface sounds live in the browser and hands back the recipe rather than a file: a plain object of layers, envelopes and filters, plus a copyable player of about 4kb with no dependencies that turns the recipe into Web Audio nodes. Categories are tap, hover, transition, success, error, warning, notification and experimental, and a Familiar to Exotic slider moves between the hand-curated library and a remix engine that rebuilds those sounds into new structures, which is the point: no two sites ship the same kit. Export WAV or copy the sound, and recent sounds survive a refresh. Built by m1ckc3s, open source at github.com/m1ckc3s/procedural-sounds, self-described as an early beta at v0.3.1 with no license named on the page.",
      },
      {
        title: "Screen Movie",
        href: "https://screen.movie",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["macos"],
        useFor: [
          "screen recorder mac",
          "record screen and edit",
          "screen recording app",
          "product demo video",
          "animated captions",
          "motion templates video",
        ],
        description:
          "Native macOS screen recorder that keeps going into an editor: capture the screen or a screenshot, then cut scenes together, add animated text, captions and music, and run them through motion templates before a 4K export. The pitch is covering capture and polish in one app instead of handing a raw recording to a separate editor. Still unreleased as of August 2026, with the page reading 'Launch soon' and committing only to macOS 15 or later and a one-time purchase with no price attached. The page names no developer, but it is listed in the same product family as Supaste and Cooldock.",
      },
      {
        title: "Pixlo",
        href: "https://pixlo.me",
        dateAdded: "2026-07-25",
        description:
          "Free browser tool that turns a set of photos into a short video slideshow: drop the images in, customize each slide, export something sized for Reels, Stories or a social post. Posted by designer Tran Mau Tri Tam, who built it entirely by prompting in Figma Make and originally made it for his own monthly recaps before opening it to everyone. Reach for it when a full video editor is more than the job needs.",
      },
      {
        title: "Motion Extractor",
        href: "https://aescripts.com/motion-extractor/",
        dateAdded: "2026-07-21",
        description:
          "After Effects plugin (version 1.0) sold through aescripts that isolates the motion in a clip: it compares footage frame by frame and removes everything that stays still, leaving only what changed. The result is a ghostly, high-contrast reading of movement that is otherwise invisible in the plate, useful both as a finished look for music videos and abstract work, and as a compositing aid for spotting drift or subtle camera shake. Good visual reference for the same trick in a shader or canvas effect: difference the current frame against the previous one.",
      },
      {
        title: "LosslessCut",
        href: "https://github.com/mifi/lossless-cut",
        dateAdded: "2026-07-21",
        description:
          "Cross-platform desktop GUI over FFmpeg for trimming and cutting video and audio without re-encoding, so a rough cut of large camera, GoPro, or drone footage is near instant and quality is untouched. It copies stream data directly rather than transcoding, and handles multi-track editing, stream manipulation, frame and thumbnail extraction, subtitles, metadata, and rotation fixes, with a CLI and an HTTP API. Built by Mifi as a solo Electron and TypeScript project in Norway, GPL-2.0, roughly 42k stars, shipped for macOS, Windows, and Linux through the App Store, Microsoft Store, Snapcraft, and Flathub.",
      },
      {
        title: "Cutting Live Broadcast Latency With Fishjam",
        href: "https://fishjam.swmansion.com/blog/cutting-live-broadcast-latency-with-fishjam",
        dateAdded: "2026-07-20",
        description:
          "Case study on getting live broadcast latency down from over 7 seconds to around 2, worth reading before you pick a streaming architecture. Written by Maciej Rys (July 2026) about ChatBCC, a community app for celebrities and athletes. Both candidate stacks, LiveKit plus MUX and Fishjam plus MUX, landed at roughly 7 seconds; the win came from dropping the HLS delivery layer and serving viewers over WebRTC end to end, using WHIP, WHEP, an SFU and GPU compositing. Includes a cost table for a 60 minute session with 3 hosts and 500 viewers at 720p: about $20 on Fishjam alone versus $33.50 and $34 for the MUX-backed options.",
      },
      {
        title: "Cuelume",
        href: "https://cuelume-site.pages.dev/",
        dateAdded: "2026-07-16",
        description:
          "Lightweight JavaScript library that synthesizes interactive sound effects for web interfaces using the Web Audio API, no audio files or external dependencies required. By Daniel White (github.com/Danilaa1/cuelume), MIT-licensed with zero runtime dependencies and all 14 sound presets totaling under 5KB combined.",
      },
      {
        title: "Audio by Raphael Salaja",
        href: "https://audio.raphaelsalaja.com/",
        dateAdded: "2026-07-14",
        description:
          "@web-kits/audio, a declarative audio synthesis library for the web: define sounds as plain objects (sources, envelopes, effects) and play them with a simple function call. This is the library powering this site's own hover sounds. Ships as the @web-kits/audio npm package (v0.2.0), built by Raphael Salaja, with a defineSound/useSound/usePatch API for React.",
      },
      {
        title: "soundcn",
        href: "https://www.soundcn.xyz/",
        dateAdded: "2026-07-14",
        description:
          "Free sound effects library packaged for modern web apps, shadcn-style naming for a UI-ready audio asset collection. Installed shadcn-style via a CLI copy-paste command that drops sound source files straight into your repo, not an npm dependency.",
      },
      {
        title: "soundzjs",
        href: "https://soundzjs.vercel.app/docs",
        dateAdded: "2026-07-14",
        description:
          "React library for adding customizable sound effects to UI elements, with theming, haptic feedback and accessibility built in. Ships 25 built-in effects like boop, pop, and victory under the soundz npm package, built by Kaycee Ingram under MIT license.",
      },
      {
        title: "Remocn",
        href: "https://www.remocn.dev/docs/compositions",
        dateAdded: "2026-07-14",
        description:
          "React animation library (built for Remotion-style video generation) offering higher-level compositions that combine primitives, UI blocks and transitions into finished animated 'shots', plus lower-level building blocks. Built by a single open-source maintainer, Remocn has racked up nearly 1,000 GitHub stars for compositions like Infinite Bento Pan and Live Code Compilation.",
      },
      {
        title: "Mediabunny",
        href: "https://mediabunny.dev/",
        dateAdded: "2026-07-14",
        description:
          "Zero-dependency JavaScript/TypeScript library for reading, writing and converting video and audio files directly in the browser, built from scratch for speed and small bundle size. Built by Vanilagy under MPL-2.0, it extracts metadata roughly 470x faster than ffmpeg.wasm (862 ops/s vs 1.83 ops/s) at just 30kB gzipped.",
      },
      {
        title: "VERT",
        href: "https://vert.sh/",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source, privacy-friendly file converter that runs entirely client-side, no upload to a server for the conversion. Fully open source with no file-size caps or ads, and maintains an active Discord community around the project.",
      },
      {
        title: "Optimo",
        href: "https://optimo.microlink.io/",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source CLI for optimizing and converting images and video, built on ImageMagick and FFmpeg, supporting 14 formats with batch resizing, lossy compression and metadata handling. Built by Kiko Beats at Microlink and installable instantly via `npx optimo`, no global install required.",
      },
      {
        title: "Apple TV recreation",
        href: "https://www.frontend.fyi/tutorials/rebuilding-the-apple-tv-plus-website-with-framer-motion-and-tailwind",
        dateAdded: "2026-07-14",
        description:
          "Tutorial walking through rebuilding the Apple TV+ marketing site's interactions using Framer Motion and Tailwind, a practical reference for high-craft scroll and hover animation. Taught by instructor Jeroen Reumkens, it builds the site from scratch in Vite using useScroll and useTransform hooks rather than a pre-made starter.",
      },
      {
        title: "Supertonic",
        href: "https://github.com/supertone-inc/supertonic",
        dateAdded: "2026-07-14",
        description:
          "Open-source project from Supertone (voice AI company) related to speech/audio synthesis technology. Ships a roughly 99M-parameter ONNX model that outputs studio-grade 44.1kHz WAV audio and runs CPU-only across 31 languages.",
      },
      {
        title: "Web Reel",
        href: "https://webreel.dev/",
        dateAdded: "2026-07-14",
        description:
          "Tool that records scripted browser demos as video: describe interactions in JSON and it automates capture in a headless browser, adding cursor animation and keystroke overlays, for product demos, tutorials and CI pipelines. Maintained by Vercel Labs and built on headless Chrome plus FFmpeg, it exports MP4, GIF, or WebM at roughly 60fps.",
      },
      {
        title: "WebRTC video streaming",
        href: "https://blog.logrocket.com/webrtc-video-streaming/",
        dateAdded: "2026-07-14",
        description:
          "LogRocket guide to building real-time video streaming with WebRTC, covering the core APIs and common gotchas. Walks through the actual handshake calls, RTCPeerConnection, createOffer/createAnswer, plus ICE/STUN/TURN for NAT traversal, not just the concept.",
      },
      {
        title: "Palmier",
        href: "https://www.palmier.io",
        dateAdded: "2026-07-14",
        description:
          "AI-native video editor: multi-track timeline editing plus the ability to generate images, video and audio inline via MCP-connected models like Claude, so AI generation and traditional editing live in one interface. Y Combinator-backed, macOS-only (needs macOS 26 Tahoe), pipes into Kling V3, Veo 3.1 and Grok Imagine, with the base editor free.",
      },
      {
        title: "Freesound",
        href: "https://freesound.org",
        dateAdded: "2026-07-14",
        description:
          "Large, long-running library of Creative Commons-licensed sound effects and field recordings, searchable and free to use with attribution. Run out of Universitat Pompeu Fabra's Phonos Foundation in Barcelona, hit its 20th anniversary in 2025 with over 729,000 sounds indexed.",
      },
      {
        title: "AVAL",
        href: "https://pixelpoint.io/aval/",
        dateAdded: "2026-07-18",
        description:
          "Pixel Point's open-source web video player for interactive, state-driven video experiences that respond to hover, focus and application state. Runs on WebCodecs plus WebGL2 for packed-alpha transparency, no mandatory WASM runtime, with a deterministic state graph driving frame-accurate route transitions.",
      },
      {
        title: "RTMP streaming guide",
        href: "https://restream.io/blog/rtmp-streaming/",
        dateAdded: "2026-07-18",
        description:
          "Restream's practical guide to the RTMP live-streaming protocol, covering encoders, streaming-platform support, setup and how RTMP differs from HTTP streaming. Traces RTMP back to Macromedia's original Flash Player protocol and contrasts its low latency against HLS's 6-30 second delay.",
      },
    ],
  },
  {
    title: "LLMs and AI engineering",
    links: [
      {
        title: "Learn Kernels",
        href: "https://learn-kernels.com/",
        dateAdded: "2026-09-02",
        kind: "course",
        stack: ["llm", "inference", "gpu", "cuda", "triton"],
        useFor: [
          "gpu kernels",
          "inference performance",
          "llm serving",
          "kv cache",
          "continuous batching",
          "triton kernels",
          "flashattention",
          "gpu profiling",
        ],
        description:
          "Interactive book on GPU kernels and inference performance, useful when you need the vocabulary from a single kernel up through a fleet of LLM serving machines. It is ordered from one inference request down to threads, blocks, warps, matrix multiplication, tensor cores, attention, Triton, CUTLASS, profiling, continuous batching, KV cache systems, quantization, speculative decoding, distributed inference, MoE serving and current hardware. Every factual claim traces to a primary source and the reading list is grouped by GPU fundamentals, kernel optimization, programming models, inference engines, distributed inference, hardware and frontier work.",
      },
      {
        title: "Training AI to Paint with Code",
        href: "https://surya.website/rling-qwen-to-paint-with-code",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["llm", "rl", "p5"],
        useFor: [
          "rl for design",
          "paint with code",
          "reward function for aesthetics",
          "pairwise judge rl",
          "p5.brush generation",
          "gepa prompt evolution",
        ],
        description:
          "Surya Narreddi's March 2026 write-up of training a language model with Cameron Franz and Alex Wang to draw by emitting editable p5.brush JavaScript, then scoring the PNG. The loop is prompt, model writes a sketch, Puppeteer renders, a judge compares against a hand-rated pool, GRPO updates. A nine-signal rubric plateaued at about 0.65 reward with clip-art flowers. Collapsing to a compile gate, a length check, HPSv3 at 0.30 and pairwise judgment against 117 love-tier images at 0.60 climbed past that and cut verbose code from 13,500 tokens to under 2,000. Reference pool is 581 model paintings from 1,664 generations. GEPA prompt evolution threw out a 400-line API dump for an eight-method allowlist. Thesis video on Vimeo. Technical report promised June 2026. Not a product you install.",
      },
      {
        title: "local.ai",
        href: "https://local.ai/",
        dateAdded: "2026-08-05",
        kind: "directory",
        stack: ["llm", "local-llm", "inference", "hardware", "benchmarks"],
        useFor: [
          "local ai benchmarks",
          "run llm locally",
          "local llm hardware",
          "what hardware for local llm",
          "cost per task",
          "local inference benchmarks",
          "energy use of local models",
        ],
        description:
          "Independent benchmark index charting the transition from cloud AI to local AI, measuring agentic capability, task time and energy end to end on the same workload across hardware you can actually buy. Its headline number is the local.ai index, one score per model derived from five agentic benchmarks (tau-squared, GAIA, GDPEval, terminal-bench-2 and swe-bench-pro), and it pointedly refuses tokens per second: a task is one whole benchmark problem solved start to finish, a research question or a real GitHub issue, and cost is cents per task once you amortize the cheapest machine that fits the model over a three year life. Charts read better up and to the right, one node per model, with ringed nodes expanding to show their quantization trade-offs. Sections cover Hardware, Models, Energy and a Wall. Currently an early access developer preview behind an access code, and whoever runs it is not named on the site.",
      },
      {
        title: "vLLM documentation",
        href: "https://docs.vllm.ai/en/latest/",
        dateAdded: "2026-07-29",
        description:
          "Official docs for vLLM, the inference and serving library that started at UC Berkeley's Sky Computing Lab and is now maintained by over 2,000 contributors. Read it before self-hosting a model: it covers PagedAttention, continuous batching, prefix caching, speculative decoding, structured output, multi-LoRA, and quantization across FP8, INT4, INT8, GPTQ, AWQ and GGUF. Backends span NVIDIA and AMD GPUs, x86, ARM and PowerPC CPUs, and accelerators including Google TPU, Intel Gaudi, IBM Spyre, Huawei Ascend and Apple Silicon. Sections run from quickstart through serving and parallelism strategies to design internals and the API reference. This URL is the developer preview; the site links to the stable release docs.",
      },
      {
        title: "Inside vLLM: Anatomy of a High-Throughput LLM Inference System",
        href: "https://vllm.ai/blog/2025-09-05-anatomy-of-vllm",
        dateAdded: "2026-07-19",
        description:
          "vLLM's architectural walkthrough of high-throughput serving, from the engine core and scheduler to chunked prefill, prefix caching, speculative decoding and distributed multi-GPU deployment. It also gives concrete latency and throughput metrics, plus the benchmark commands needed to tune a real serving workload.",
      },
      {
        title: "llms.txt Directory",
        href: "https://llmstxt.site/",
        dateAdded: "2026-07-16",
        description:
          "Directory of llms.txt file locations across the web with stats, tracking which sites publish the standard file that tells language models how to read and use their content. Tracks the llms.txt standard Jeremy Howard's Answer.AI proposed in September 2024, and shows each listed site's file size in tokens.",
      },
      {
        title: "tokenmaxxing.sh",
        href: "https://tokenmaxxing.sh/#leaderboard",
        dateAdded: "2026-07-18",
        description:
          "Usage tracker and public leaderboard for AI coding-agent token consumption, spend and active days across supported tools. Parses local usage via ccusage across Claude Code, Codex, OpenCode, Gemini CLI, and Copilot CLI; the current top spender has burned over $220,000.",
      },
      {
        title: "Vibe coding is not AI-assisted engineering",
        href: "https://addyo.substack.com/p/vibe-coding-is-not-the-same-as-ai",
        dateAdded: "2026-07-14",
        description:
          "Addy Osmani essay drawing a line between casually 'vibe coding' with an LLM and disciplined AI-assisted software engineering, arguing the two get conflated in ways that hurt production code quality. Osmani likens unreviewed AI code to an electrician who \"threw a bunch of cables through your walls and hoped it all worked out.\"",
      },
      {
        title: "Building an elite AI engineering culture",
        href: "https://www.cjroth.com/blog/2026-02-18-building-an-elite-engineering-culture",
        dateAdded: "2026-07-14",
        description:
          "Argues AI amplifies a team's existing strengths rather than leveling the playing field; elite results need taste (knowing what to build), discipline (spec-driven process, real testing) and leverage (small teams, powerful tools) multiplied together, citing Linear, Cursor and Vercel. Points to Cursor hitting $500M ARR faster than any SaaS company in history as evidence of what taste plus AI leverage can produce.",
      },
      {
        title: "Effective communication in AI engineering",
        href: "https://jxnl.co/writing/2024/10/15/effective-communication-in-ai-engineering-moving-beyond-vague-updates/",
        dateAdded: "2026-07-14",
        description:
          "Jason Liu (jxnl) essay on why AI engineering teams need more precise status communication than 'still working on it', and how vague updates hide real progress and risk. Proposes a five-part update format (Hypothesis, Intervention, Results, Trade-offs, Takeaway) and the line \"adjectives mean you're hiding something.\"",
      },
      {
        title: "How LLMs actually work",
        href: "https://www.0xkato.xyz/how-llms-actually-work/",
        dateAdded: "2026-07-14",
        description:
          "Plain-language explainer of how large language models work under the hood, aimed at engineers who use LLMs daily but haven't studied the internals. Walks through nine components end to end, down to specifics like Mixtral 8x7B's 46.7B total but only 12.9B active parameters per token.",
      },
      {
        title: "How to Scale Your Model",
        href: "https://jax-ml.github.io/scaling-book/",
        dateAdded: "2026-08-05",
        kind: "essay",
        stack: ["jax", "tpu", "gpu", "llm"],
        useFor: [
          "model parallelism",
          "how tpus work",
          "llm inference cost",
          "roofline analysis",
          "scaling transformers",
          "kv cache memory",
          "training cost estimate",
        ],
        description:
          "Free online book on the systems side of large language models, by Jacob Austin, Sholto Douglas, Roy Frostig, Anselm Levskaya, Reiner Pope and seven other authors at Google DeepMind, published February 2025 and still revised. It answers the questions sitting between research and infrastructure: what a matrix multiply of a given size should take, when you are compute bound rather than memory or communication bound, how to choose among data, tensor, pipeline and expert parallelism, and what it would actually cost to train or serve a model yourself. Twelve chapters run from roofline analysis and TPU internals through Transformer parameter and FLOP math into training and inference, then two practical walkthroughs train and serve LLaMA 3 on TPUs with real latency and throughput tradeoffs, followed by chapters on programming TPUs in JAX, profiling the JAX and XLA stack, and a bonus chapter on how GPU rooflines and networking differ. It assumes you know the Transformer architecture but not how it behaves at scale, and sets worked problems throughout.",
      },
      {
        title: "LLM Visualization",
        href: "https://bbycroft.net/llm",
        dateAdded: "2026-07-14",
        description:
          "Well-known interactive 3D visualization of a GPT-style language model, watch tokens flow through embeddings, attention and MLP layers in real time. Built by Brendan Bycroft; renders nano-GPT through GPT-3-scale networks in-browser via WebGL, no install or backend required.",
      },
      {
        title: "The Transformers",
        href: "https://www.vizuaranewsletter.com/p/the-transformers",
        dateAdded: "2026-07-14",
        description:
          "Newsletter explainer on the Transformer architecture, the attention-based model behind essentially every modern LLM. Written by Mayank Pratap Singh of Vizuara AI Labs: 24 sections with runnable PyTorch snippets and a linked GitHub notebook repo.",
      },
      {
        title: "LLM Architecture Gallery",
        href: "https://sebastianraschka.com/llm-architecture-gallery/",
        dateAdded: "2026-07-14",
        description:
          "Sebastian Raschka's visual gallery comparing the architectures of major LLM families side by side, a fast way to see how GPT, Llama, Mistral and others actually differ structurally. Spans 85 models from a 270M-parameter Gemma 3 to a 1.6T-parameter DeepSeek V4-Pro, covering releases from 2019 GPT-2 through mid-2026.",
      },
      {
        title: "Hyperagents",
        href: "https://arxiv.org/abs/2603.19461",
        dateAdded: "2026-07-14",
        description:
          "Paper introducing 'hyperagents': self-referential AI systems pairing a task-solving agent with a meta-agent that can rewrite both itself and the task agent as editable code, extending the Darwin Gödel Machine framework so the improvement mechanism itself is improvable. Authored by Jenny Zhang, Jeff Clune, Jakob Foerster and others; the method (DGM-H) ships as open code under facebookresearch/Hyperagents.",
      },
      {
        title: "arXiv 2501.02305",
        href: "https://arxiv.org/pdf/2501.02305",
        dateAdded: "2026-07-14",
        description:
          "Paper on open-addressed hash tables: shows they can achieve better search performance than previously believed, disproving Yao's long-standing 'Uniform Hashing is Optimal' conjecture with matching upper and lower bounds. Authored by Martin Farach-Colton, Andrew Krapivin, and William Kuszmaul, who prove the result specifically for hash tables that never reorder already-inserted elements.",
      },
      {
        title: "FMHY AI",
        href: "https://fmhy.net/ai",
        dateAdded: "2026-07-14",
        description:
          "The AI section of the FMHY (Free Media Heck Yeah) wiki, a huge categorized directory of AI tools: chatbots, image/video/audio generators, local frontends, ML frameworks and benchmarks. Spans 200+ tools across 15+ categories, including a notably candid AI-jailbreaking section pointing to prompt-leak collections like L1B3RT4S.",
      },
      {
        title: "Kill the bloat in Claude Code's system prompt",
        href: "https://www.aihero.dev/how-to-kill-the-bloat-in-claude-codes-system-prompt",
        dateAdded: "2026-07-14",
        description:
          "AI Hero post on trimming unnecessary context and instructions from a Claude Code system prompt to reduce token overhead and improve response quality. Logs the exact overhead with a proxy: 69 tools, 154,946 tool bytes, 65,538 input tokens, then trims it with flags like disableBundledSkills.",
      },
      {
        title: "KV Cache explained intuitively",
        href: "https://medium.com/@saad.ahmed1926q/kv-cache-explained-intuitively-2b425a36dfc7",
        dateAdded: "2026-07-14",
        description:
          "Intuitive explainer of the KV (key-value) cache technique that makes autoregressive LLM inference fast by avoiding recomputing attention for tokens already generated. Explains query-key relevance through a personal analogy (asking 'who is important to me?') rather than diving straight into matrix math.",
      },
      {
        title: "Berkeley EECS technical report",
        href: "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/Archive/EECS-2016-143.pdf",
        dateAdded: "2026-07-14",
        description:
          "2016 UC Berkeley EECS technical report (PDF), archival research writeup from the department's technical report series. Actually Vasily Volkov's report 'Understanding Latency Hiding on GPUs,' showing standard performance models mispredict throughput by up to 1.7x.",
      },
      {
        title: "How I use LLMs, Karpathy",
        href: "https://www.youtube.com/watch?v=EWvNQjAaOHw",
        dateAdded: "2026-07-14",
        description:
          "Andrej Karpathy's practical walkthrough of his actual day-to-day LLM usage and workflow, widely watched for its concrete, unhyped take on using these tools well. Runs about 2 hours 15 minutes (published February 2025), covering his real ChatGPT, Claude, and NotebookLM workflows rather than abstract prompting advice.",
      },
    ],
  },
  {
    title: "Machine learning and deep learning",
    links: [
      {
        title: "Models (Kyle Jeong)",
        href: "https://models.kylejeong.com/?lab=openai",
        dateAdded: "2026-09-01",
        kind: "demo",
        useFor: [
          "frontier model families",
          "model architectures",
          "compare model families",
          "model lineage",
          "which model came from which",
          "model evidence board",
        ],
        description:
          "Evidence board for exploring frontier model families and architectures, by Kyle Jeong, who also built the interactive H100 glossary. Nine cases, one per lab, selected through a lab query parameter, with the OpenAI case opening 26 artifacts you drag around a canvas instead of reading down a table. The spatial layout is the point: it suits tracing how a lab's line branched over time more than looking up a single model's specs.",
      },
      {
        title: "Google Research Blog",
        href: "https://research.google/blog/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["llm", "quantum", "health"],
        useFor: [
          "google research",
          "latest ai research",
          "research blog",
          "foundation models",
          "quantum computing research",
          "health ai research",
          "diffusion models",
          "read new ml papers",
        ],
        description:
          "Google Research's blog index, 12 posts a page across 134 pages, with year archives reaching back to 2006 and roughly 34 label filters including Generative AI, Machine Intelligence, Algorithms & Theory, Quantum, Health & Bioscience, Responsible AI and Open Source Models & Datasets. Every post is tagged with the research areas it belongs to, which makes it a readable front door to work you would otherwise meet as a PDF. A recent sample: a planetary prediction engine automating global models via Earth AI, GlucoFM as a foundation model for continuous glucose monitoring, AgentHands generating interactive hand gestures for spatially grounded agent conversations in XR, an argument that recall is the bottleneck for parametric factuality, a quantum computer that learns from its errors, and an attempt at demystifying the creativity of diffusion models. Health and bioscience is the densest area at the moment; the companion code lives under the google-research GitHub org.",
      },
      {
        title: "H100 GPU Glossary (interactive)",
        href: "https://gpu.kylejeong.com/",
        dateAdded: "2026-08-18",
        kind: "demo",
        useFor: [
          "h100 architecture",
          "gpu architecture explained",
          "streaming multiprocessor",
          "tensor core",
          "hbm3",
          "3d gpu model",
        ],
        description:
          "Interactive 3D H100 SXM5 module you drag to rotate, scroll to zoom and hover to inspect, with an Exterior view and an Architecture view that opens the package up. A component index of 7 parts steps through CUDA device architecture, GPU RAM (HBM3), GPU Processing Cluster, Streaming Multiprocessor, Tensor Core, CUDA Core and the Tensor Memory Accelerator, each one linking out to the matching entry in Modal's GPU Glossary for the prose definition. Built on Next.js by Kyle Jeong: the spatial companion to that glossary, useful for finally placing where an SM sits relative to HBM rather than reading it as a list of terms.",
      },
      {
        title: "Transformer Explainer",
        href: "https://poloclub.github.io/transformer-explainer/",
        dateAdded: "2026-07-22",
        description:
          "Interactive visualization that runs a live GPT-2 (small), 124 million parameters, in your browser to show how a transformer turns text into next-token predictions. Built by the Polo Chau group at Georgia Tech (Aeree Cho, Grace Kim, Alexander Karpekov, Alec Helbling, Jay Wang, Seongmin Lee, Benjamin Hoover and others) on ONNX Runtime, Svelte and D3, porting a PyTorch nanoGPT. Type your own prompt and step through embeddings, positional encoding, multi-head attention with query, key and value, the MLP, and softmax sampling with temperature, top-k and top-p controls.",
      },
      {
        title: "Max Fu's essays",
        href: "https://maxxfuu.com/essays",
        dateAdded: "2026-07-19",
        description:
          "Max Fu's technical essays on machine learning systems and inference performance. Start with the Roofline Model guide for a clear way to reason about whether an inference workload is limited by compute throughput or memory bandwidth before tuning it.",
      },
      {
        title: "Maths, CS and AI compendium",
        href: "https://github.com/HenryNdubuaku/maths-cs-ai-compendium",
        dateAdded: "2026-07-14",
        description:
          "GitHub-hosted compendium of math, computer science and AI learning resources, organized as a structured reading path rather than a random link dump. Written by Y Combinator alum Henry Ndubuaku across 20 chapters, it ships an MCP server so AI assistants can query the notes directly.",
      },
      {
        title: "ML Visualizer",
        href: "https://mlvisualizer.org/",
        dateAdded: "2026-07-14",
        description:
          "Interactive visualizations of machine learning concepts and model behavior, for building intuition beyond the equations. Built at Georgia Tech for a generative-AI course, it renders 13 models (RBMs, Hopfield nets, Mamba2, Transformers), far beyond a single feedforward net.",
      },
      {
        title: "TensorFlow Playground",
        href: "https://playground.tensorflow.org/",
        dateAdded: "2026-07-14",
        description:
          "Google's classic interactive neural network visualizer: adjust layers, features and hyperparameters in the browser and watch a small network learn a toy dataset in real time. Built by Daniel Smilkov and Shan Carter on a purpose-written tiny neural net library, not TensorFlow itself, with 4 activation functions and 12 learning-rate settings.",
      },
      {
        title: "GPU Glossary",
        href: "https://modal.com/gpu-glossary",
        dateAdded: "2026-07-14",
        description:
          "Modal's reference glossary for GPU and CUDA terminology, demystifying the vocabulary (SMs, warps, tensor cores, memory hierarchy) that GPU performance work assumes you already know. Maintained by Modal (Charles Frye et al.), it spans roughly 80 entries across five sections: device hardware, device software, host software, and performance.",
      },
      {
        title: "Quantization from the ground up",
        href: "https://ngrok.com/blog/quantization",
        dateAdded: "2026-07-14",
        description:
          "Explainer on model quantization, how reducing numeric precision shrinks models and speeds inference, and the tradeoffs involved, from first principles. Written by ngrok's Sam Rose, it walks through quantizing Qwen-3-Coder-Next (80B params, 159.4GB) to 4-bit, a 4x size cut and 2x speedup for 5-10% accuracy loss.",
      },
      {
        title: "TurboQuant",
        href: "https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/",
        dateAdded: "2026-07-14",
        description:
          "Google Research blog post on TurboQuant, a technique for extreme model compression aimed at making AI inference dramatically more efficient. Google's TurboQuant hits 3-bit KV-cache compression with no training or accuracy loss, and an 8x attention-logit speedup on H100s versus 32-bit keys.",
      },
      {
        title: "Best resources to learn deep learning",
        href: "https://www.mltut.com/best-resources-to-learn-deep-learning/",
        dateAdded: "2026-07-14",
        description:
          "Roundup of recommended courses, books and resources for learning deep learning from scratch. Curated by ML PhD scholar Aqsa Zafar into 40+ picks (13 courses, 9 books, 8 tutorials, 10 videos), topped by deeplearning.ai's Specialization and Goodfellow's textbook.",
      },
      {
        title: "Algebrica",
        href: "https://algebrica.org/",
        dateAdded: "2026-07-14",
        description:
          "Resource site for learning the mathematics (algebra and beyond) underpinning machine learning and computer science. A free, CC BY-NC 4.0 wiki-style knowledge base spanning 22 chapters from set theory through differential equations, built solo by developer Antonio Lupetti and open to community edits on GitHub.",
      },
      {
        title: "Label Studio",
        href: "https://labelstud.io",
        dateAdded: "2026-07-14",
        description:
          "Open-source data labeling tool for machine learning, supporting text, image, audio and video annotation for building training datasets. Built by HumanSignal and used by over 1 million practitioners at companies like Meta, NVIDIA, and Cloudflare, with a 20,000+ member Slack community backing the open-source core.",
      },
    ],
  },
  {
    title: "AI tools, agents and search",
    links: [
      {
        title: "Is Agentic",
        href: "https://is-agentic.com/",
        dateAdded: "2026-08-29",
        kind: "tool",
        stack: ["mcp", "cli", "agents"],
        useFor: [
          "agent readiness score",
          "is my site agentic",
          "score a website for agents",
          "llms.txt check",
          "mcp readiness",
          "agent crawler report",
          "npx is-agentic",
        ],
        description:
          "Free scanner that scores how ready a public website is for AI agents, then lists evidence and recommended fixes. Built by Ora and launched with Vercel in August 2026. Paste a URL in the browser or run `npx is-agentic <domain>` (`--json` for the structured report). Essential checks cover server-rendered HTML, HTTP behaviour and document structure; recommended checks only fire when the scan finds an API, OAuth, GraphQL, MCP, docs portal or commerce surface, so a brochure site is not docked for missing those. Reports stay at a stable URL, render in the first HTML response, and are also available as Markdown, a versioned JSON API, OpenAPI, and a read-only MCP tool. Pricing page says free.",
      },
      {
        title: "Atat (@@)",
        href: "https://atatapp.com/",
        dateAdded: "2026-08-21",
        kind: "tool",
        stack: ["macos", "swift", "claude-code", "codex", "cli", "agents"],
        useFor: [
          "agent in any text field",
          "run claude code anywhere",
          "system wide agent trigger",
          "mac clipboard history",
          "screenshot straight to an agent",
          "rewrite selected text",
          "finder as working directory",
        ],
        description:
          "Native macOS app that runs whichever coding agent CLI you already have from any text field: type @@ in a native app, a browser text box or Finder, and the answer lands back where you were typing. Bring your own agent covers Claude Code, Codex, Grok, Cursor, Pi, Hermes and OpenCode, and anything else with a CLI can be added. Screen context is attached automatically, a selection bar adds rewrite, translate and explain that replace the text in place, Finder makes its window the working directory and sends the selected files along, and Command Return hands the job to an interactive agent in your terminal at the right path. It also absorbs the small utilities around that loop: searchable clipboard history, area, window, scrolling and recording capture, image annotation and cropping, video trim and export to GIF. Swift rather than Electron, under 20 MB, prompts and history stay on the machine. Download is Atat-0.5.0.dmg; the site names no maker and no pricing.",
      },
      {
        title: "fx",
        href: "https://fx.sh/",
        dateAdded: "2026-08-19",
        kind: "tool",
        stack: ["zig", "wasm", "cli", "agents", "mcp"],
        useFor: [
          "coding agent cli",
          "terminal agent",
          "embed an agent",
          "lightweight agent harness",
          "agent in the browser",
        ],
        description:
          "Coding agent harness from Vercel Labs, written in Zig, built for research and for embedding inside larger systems. Deliberately not an IDE in the terminal: it keeps shell scroll history, emits little output and avoids repainting, and claims a 10 microsecond cold start on a single-digit megabyte memory baseline so many instances can share one machine. The network stack is pluggable, which is how the site runs the CLI compiled to WebAssembly with browser fetch doing the networking (needs JSPI, so Safari 27+ or Chrome). Model and provider agnostic, extended through skills, plugins and MCPs. v0.0.3, 6.39 MiB, Apache-2.0 at vercel-labs/fx, flagged experimental with frequent changes. Install with curl -fsSL https://fx.sh/setup.sh | bash.",
      },
      {
        title: "Motion by Mosaic",
        href: "https://motion.so/",
        dateAdded: "2026-08-14",
        kind: "tool",
        stack: ["mcp", "video"],
        useFor: [
          "text to video",
          "launch video",
          "product demo video",
          "logo animation",
          "motion design agent",
          "prompt to video",
          "ai motion graphics",
          "video over mcp",
        ],
        description:
          "AI agent that turns a one-sentence prompt into a finished motion-graphics video, for launch films, product demos, logo animations, and social ads. Built by Mosaic AI Labs (mosaic.so) and launched 2026-06-18; Adish Jain wrote the intro post. The run is five steps: a one-line brief, research that reads your site for brand colors and type, a scene-by-scene storyboard, then a build of visuals, motion graphics, voiceover, music, and captions, after which you edit individual elements by hand or in chat instead of regenerating whole scenes. Plan presets include launch video, brand documentary, deep-dive explainer, animated story, logo animation, talking head, and article-to-video, and you can call it from Claude, ChatGPT, Cursor, or any agent over MCP or the API. Subscriptions shown on the affiliate page are Pro at $29 a month and Max at $99 a month, plus credit packs and usage top ups.",
      },
      {
        title: "OpenMotion",
        href: "https://openmotion.design/",
        dateAdded: "2026-08-14",
        kind: "tool",
        stack: ["claude-code", "codex", "macos", "motion"],
        useFor: [
          "motion graphics",
          "ai motion design",
          "logo animation",
          "explainer video",
          "launch video",
          "product video",
          "animate from a prompt",
          "transparent webm",
        ],
        description:
          "Mac app that generates a motion graphics scene from a text prompt and then hands you a real editing surface for it, aimed at product videos, launch teasers, explainers and logo motion when there is no motion designer on the team. Version 1.1.0 (build 4) ships as a 326 MB .dmg with Apple silicon and Intel builds and automatic architecture detection, and it runs on an existing Claude Code or Codex subscription instead of separate API keys. Editing is a scene-based canvas with a layer and audio timeline plus reusable brand kits, exporting to video, transparent WebM, or self-contained HTML for the web. Free while it is being built, with a higher-limit Pro plan mentioned but unpriced; despite the name there is no repository or license on the site, only the download, and no company or maintainer is named anywhere.",
      },
      {
        title: "VibeIndex",
        href: "https://vibeindex.dev/",
        dateAdded: "2026-08-12",
        kind: "directory",
        stack: ["ai", "agents", "vibe-coding", "mcp"],
        useFor: [
          "vibe coding tools",
          "ai coding tools",
          "ai coding agents",
          "browse ai tools",
          "ai app builder",
          "ai code editor",
          "find an ai tool",
          "coding agent directory",
        ],
        description:
          "Directory of tools for AI-assisted coding, worth a scan when you want to see what exists in a category before committing to one. The header claims 285 tools across 16 categories while the filter list enumerates 15, the largest being Browser-based App Builders (41), CLI Tools (36), IDE Extensions and Plugins (27) and Learning Resources (26), tailing off through UI Generators (10) and Desktop Apps (8) to MCP Servers and Tooling (4). Each listing gets a screenshot, a category, a domain and its own detail page, and a Most stars sort option implies GitHub stars are tracked as metadata. No maintainer, company or contact appears anywhere on the site, the submit page states no criteria, and dead or acquired entries are kept in place with caveats noting a repo went private or a company folded, so read freshness as unverified.",
      },
      {
        title: "GetLayers",
        href: "https://www.getlayers.ai/",
        dateAdded: "2026-08-11",
        kind: ["tool", "directory"],
        stack: ["ai", "prompts", "landing-page", "3d", "mcp"],
        useFor: [
          "landing page prompt",
          "ai prompt library",
          "hero section prompt",
          "3d scene prompt",
          "look ai generated",
          "animated background",
          "landing page template",
          "web design prompts",
        ],
        description:
          "Library of AI prompts for landing pages and web design elements: copy a prompt, paste it into a coding agent, and the result is meant to avoid the default AI-generated look. Built by textura.agency, 211 layers at time of adding, split into 83 3D scenes, 78 backgrounds, 40 templates and 10 sections, filterable by tone (148 dark, 63 light) and by mood such as Luxe, Technical, Organic or Calm, with new drops on Fridays. Free covers a curated set with no usage cap; Unlimited is $14 a month under a fair use limit of 3 prompt copies a week, and Full Stack is $19 and adds source code, video downloads and a private Discord, both carrying a commercial license for client work. An MCP server and a matching Claude skill let an agent pull a section or generate a 3D scene without leaving the editor, via `claude mcp add --transport http getlayers https://mcp.getlayers.ai/mcp` or the plugin marketplace at textura-agency/getlayers-plugin, though MCP access is gated behind the Full Stack Lifetime plan.",
      },
      {
        title: "Rikyū",
        href: "https://rikyu.ai/",
        dateAdded: "2026-08-11",
        kind: "tool",
        stack: ["ai", "design", "image-generation"],
        useFor: [
          "ai design tool",
          "ai brand identity",
          "brand assets",
          "generate a logo",
          "visual identity",
          "app store screenshots",
          "poster design",
          "design without a designer",
        ],
        description:
          "AI design tool that takes one sentence about a business and returns a whole visual identity, for when you need brand assets and have no designer. From a prompt such as launching a coat label from Antwerp it produces a monogram, app icon, App Store screenshots, app screens, landing and product pages, city posters, a lookbook spread, social stories and OGP images, then iterates through a describe what you want to change field. It connects to Claude and Codex over MCP, billed as creating without spending Rikyū credits, and includes an asset library of more than 3 million items. Pricing is $5 a month for MCP and commercial use, $20 for 16,000 monthly credits with design generation, image generation and background removal, and $50 for 48,000 credits; the developer is credited only as @kaiseisuzuk on X.",
      },
      {
        title: "Reve",
        href: "https://app.reve.com/",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["ai", "image-generation", "design"],
        useFor: [
          "ai image generation",
          "ai image editor",
          "edit a generated image",
          "text in ai images",
          "ai design tool",
          "product photography ai",
          "change aspect ratio of an image",
        ],
        description:
          "Image model paired with a real editing surface, so generation and art direction happen in one place instead of re-rolling a prompt until it lands. From Reve AI in Palo Alto, founded in 2023 by Michael Gharbi, Mike Speiser and Taesung Park; the model first circulated under the codename Halfmoon and topped the Artificial Analysis image rankings before the company announced itself. The editing side is the point: move, resize or recolor individual objects, sketch annotations straight onto the canvas, apply references split into Style, Person and Place, stack live layers combining text and images, apply preset or custom shader effects, and reframe a scene to any aspect ratio. It describes the approach as images as code, a structured layout representation that keeps elements addressable, which is the stated reason typography and spatial composition hold up better than usual; billing is credit based with a free daily allowance alongside subscriptions and an API, and users keep rights to what they generate.",
      },
      {
        title: "Litter",
        href: "https://kittylitter.app",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["ios", "android", "agents", "claude-code", "codex"],
        useFor: [
          "coding agent on phone",
          "claude code from phone",
          "mobile agent client",
          "run agents remotely",
          "voice coding agent",
          "agent client app",
        ],
        description:
          "Native iOS and Android client for driving command-line coding agents from a phone, so a session running on a desktop or a server follows you around instead of staying pinned to one terminal. Open source under dnakov/litter and free, it connects three ways: local network auto-discovery with no IP addresses to enter, an 'alleycat' QR code peer-to-peer pairing that reaches through NATs and corporate firewalls without a VPN or port forwarding, and plain SSH to a remote box where it starts the agent on the server for you. Supports Codex, Claude, OpenCode, Pi and Droid, one at a time or in parallel, with live voice transcription for talking to an agent while walking, and 70+ themes ported from editor color schemes including Catppuccin, Dracula, Nord, Gruvbox and Solarized. Local Studio lists it as its phone companion; there is a TestFlight beta alongside the App Store and Play builds.",
      },
      {
        title: "Local Studio",
        href: "http://localstudio.ai",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["llm", "local-llm", "vllm", "mlx", "llama.cpp", "macos"],
        useFor: [
          "run models locally",
          "local ai workspace",
          "local inference server",
          "self host llm",
          "openai compatible api",
          "local model desktop app",
          "vllm sglang mlx llama.cpp",
        ],
        description:
          "Desktop AI workspace for running models on your own machine, pitched on keeping the model, the runtime and the hardware together rather than hidden behind a provider abstraction. It unifies four inference backends, vLLM, SGLang, MLX and llama.cpp, under a single OpenAI-compatible API, with Hugging Face model search that flags hardware fit before you download, plus live status, launch state, logs and metrics across local and remote controllers. A combined session surface puts models, providers, browser, files, terminal and agents in one workbench, and phones pair through the companion app Litter to continue sessions remotely across Codex, Claude, OpenCode, Pi and Droid. Public repo under sybil-solutions/local-studio; only a macOS download is offered, and no pricing or license is stated on the page.",
      },
      {
        title: "LogoCreator",
        href: "https://www.logo-creator.io/",
        dateAdded: "2026-08-04",
        useFor: [
          "logo generator",
          "generate a logo",
          "ai logo maker",
          "make a logo",
          "logo ideas",
          "brand kit export",
        ],
        description:
          "Open source AI logo generator: enter a company name, pick a style, and get logo variations back. Built by GitHub user Nutlope (repo Nutlope/logocreator, 7.4k stars) on FLUX.2 pro through Together AI for generation and FLUX.1 Kontext for edits, in Next.js App Router with Radix and Tailwind. Clerk auth and Upstash rate limiting are both optional, so a self-hosted copy runs account-less on your own Together AI key, while the hosted site gates generation behind sign-in with two free credits. It offers 14 industry quick starts, eight styles (Minimal, Geometric, Gradient, Mascot, Hand-drawn, Luxury, Retro, 3D) and 1, 2 or 4 variations per run; exports are PNG only today, with SVG on the stated roadmap and no LICENSE file in the repo.",
      },
      {
        title: "Agentation",
        href: "https://benji.org/agentation",
        dateAdded: "2026-07-30",
        description:
          "Visual feedback toolbar for AI coding agents: click, multi-select, or draw an area around any UI element, including empty space, to annotate it, or pause CSS animations to annotate a specific frame, then export plain markdown that Claude Code, Cursor, and other agents can act on directly. Built by Benji Taylor with Dennis Jin and Alex Vanderzon as a single React component (`npm install agentation`), dev-environment only, now at v1 with four output verbosity modes: Compact, Standard, Detailed, and Forensic. The documentation site itself was built using the tool, through hundreds of annotation iterations. Published January 21, 2026.",
      },
      {
        title: "devtools.sh",
        href: "https://devtools.sh/",
        dateAdded: "2026-07-25",
        description:
          "Directory of 224 AI developer tools, sortable by GitHub stars, latest commit, recently added or name, for surveying a category before committing to one tool. Built by Tim Hanlon with agents and powered by Minima; the largest categories are Orchestration (37), Desktop Applications (23), Local Inference (23), Frameworks and SDKs (17) and Harnesses (17), alongside Agent Memory, Skills and Prompts, Evals and Autonomous Agents. Open-source entries are flagged OSS and link to their repos, and there are separate model and article sections.",
      },
      {
        title: "Expo MCP Server",
        href: "https://docs.expo.dev/mcp/",
        dateAdded: "2026-07-23",
        description:
          "A remote MCP server hosted by Expo that wires AI-assisted tools into your Expo projects, so an agent can read the official docs on demand, install dependencies with npx expo install, and trigger and monitor EAS builds, workflows, and TestFlight data. It runs as a streamable HTTP endpoint at mcp.expo.dev/mcp with OAuth through your Expo account, and the docs list 27 tools plus 1 prompt covering doc search, library installation, workflow and build control, and App Store interactions. Supported clients include Claude Code (claude mcp add), Cursor, VS Code, and Codex; screenshot and simulator automation needs a local SDK 54+ project with the expo-mcp package.",
      },
      {
        title: "arxiv-sanity-lite",
        href: "https://github.com/karpathy/arxiv-sanity-lite",
        dateAdded: "2026-07-22",
        description:
          "Andrej Karpathy's lightweight rewrite of arxiv-sanity for keeping up with new papers on your terms. A daemon polls the arXiv API for recent submissions, then you tag the papers you care about and it recommends similar new ones per tag by training an SVM over tfidf features of the abstracts. You can search, rank, sort and slice results in the web UI, and opt into a daily email of fresh recommendations. Self-hostable Python (arxiv_daemon.py, compute.py, serve.py, send_emails.py); the arxiv-sanity-lite.com instance Karpathy ran is no longer live, so this is the repo to deploy yourself.",
      },
      {
        title: "Claude Code iOS Simulator pane",
        href: "https://code.claude.com/docs/en/desktop-ios-simulator",
        dateAdded: "2026-07-22",
        description:
          "Anthropic's docs for the iOS Simulator pane in Claude Code Desktop: your app runs in Apple's simulator next to the conversation, streamed live, with Claude building, installing, tapping through, and reading the screen to verify its own changes while you can tap the same device yourself. Each session gets its own devices (up to 4 panes), consent is per-device, and no computer use or macOS screen permissions are needed since the pane drives the simulator directly. Public beta on macOS for Pro, Max, and Team plans; requires Claude Desktop v1.24012.0+ and Xcode with the iOS platform, local sessions only.",
      },
      {
        title: "Webclaw",
        href: "https://webclaw.io/",
        dateAdded: "2026-07-22",
        description:
          "Web extraction API that turns a URL into markdown, JSON, HTML, plain text, or an LLM-optimized format, aimed at feeding pages to agents without burning tokens on raw markup. Skips headless browsers in favour of HTTP with TLS fingerprint impersonation, returning static pages in roughly 118ms, and handles bot protection, CAPTCHAs, JavaScript rendering, and PDF/DOCX/XLSX detection. Reachable as an MCP server (12 tools for Claude, Cursor, and Codex), a REST API with 14 endpoints, or a CLI, with a Firecrawl compatibility layer on /v2 routes. Written in Rust, AGPL-3.0 and self-hostable, with paid cloud tiers from $19/month and a free tier of 3 daily runs.",
      },
      {
        title: "pi-observational-memory",
        href: "https://github.com/elpapi42/pi-observational-memory",
        dateAdded: "2026-07-22",
        description:
          "Extension for the Pi coding agent that keeps long sessions coherent by recording observations and distilling reflections instead of repeatedly re-summarizing the transcript, which loses detail every cycle. Memory work runs in background workers during natural pauses, so compaction is fast when it fires, and a recall tool traces any stored fact back to its source evidence. Adds /om:status and /om:view commands, with default thresholds of 10K tokens for observations, 20K for reflections, and 81K for auto-compaction. Written in TypeScript by elpapi42, MIT licensed, around 372 stars, installed with `pi install npm:pi-observational-memory`.",
      },
      {
        title: "Voicebox",
        href: "https://github.com/jamiepine/voicebox",
        dateAdded: "2026-07-21",
        description:
          "Local-first AI voice studio that clones voices, generates speech in 23 languages, dictates into any app via a global hotkey, and gives agents a voice you own, positioned against cloud services like ElevenLabs. Built by Jamie Pine as a Tauri (Rust) and React desktop app with a FastAPI backend, running inference on MLX for Apple Silicon or PyTorch elsewhere across models including Qwen3-TTS, Chatterbox, and Kokoro, with seven TTS engines, Whisper speech-to-text, a multi-track stories editor, and an MCP server so Claude Code and Cursor can speak in cloned voices. MIT licensed, around 45k stars.",
      },
      {
        title: "Handy",
        href: "https://github.com/cjpais/Handy",
        dateAdded: "2026-07-21",
        description:
          "Offline speech-to-text desktop app: press a configurable shortcut, speak, and the transcription is pasted straight into whatever app has focus, with nothing sent to the cloud. Built by cjpais on Tauri with a Rust backend and a React and TypeScript frontend, transcribing via Whisper models or Parakeet V3 with Silero voice-activity detection and GPU acceleration when available, plus push-to-talk and a CLI. The stated goal is to be the most forkable option rather than the most accurate. MIT licensed, around 27k stars, for macOS, Windows, and Linux.",
      },
      {
        title: "Zodex",
        href: "https://zodex.dev/",
        dateAdded: "2026-07-20",
        description:
          "Native macOS coding environment written in Rust that folds AI chat, a Design Studio and a terminal into one lightweight app. Ships several models (GPT 5.3 Codex, Kimi K2.7 Code, Grok 4.3) with bring your own key support, sandboxes UI generation so experiments stay out of the codebase, dispatches agents onto Linear issues, and adds iOS and Android companions plus a voice assistant that reads the local repo.",
      },
      {
        title: "ReactBench",
        href: "https://www.reactbench.com/",
        dateAdded: "2026-07-16",
        description:
          "Evaluation platform that benchmarks coding agents on realistic React work, testing whether models can produce production-ready code that meets performance, accessibility and quality standards, not just pass basic functionality checks. Built by Million; spans 51 tasks across 8 models from 4 providers, with GPT 5.6 Sol topping out at just 43% pass rate.",
      },
      {
        title: "ai-cli",
        href: "https://ai-cli.dev/",
        dateAdded: "2026-07-14",
        description:
          "Command-line tool for generating text, image, video and audio content from various AI models directly in the terminal, supports comparing multiple models in parallel and composes with Unix pipes. Built by Vercel Labs on the AI Gateway, install via npm install -g ai-cli, and it needs only an API key, no config files or setup wizard.",
      },
      {
        title: "Models.dev",
        href: "https://models.dev/",
        dateAdded: "2026-07-14",
        description:
          "Well-known, frequently updated reference comparing LLM pricing, context windows and capabilities across providers, the go-to page when deciding which model to use for a task. Open source and maintained by the SST team on GitHub (sst/models.dev), so its pricing and spec data can be pulled programmatically rather than just browsed.",
      },
      {
        title: "ai-ng",
        href: "https://github.com/ai-ng",
        dateAdded: "2026-07-14",
        description:
          "GitHub organization building AI-powered developer tools, including Swift (a fast voice assistant) and 2txt (an image-to-text converter). Also home to magic-spell (247 stars), an AI-prompting-in-your-textarea library; Swift itself has 593 stars and 2txt has 557.",
      },
      {
        title: "AI tool system prompts",
        href: "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/Amp",
        dateAdded: "2026-07-14",
        description:
          "Widely referenced repository collecting the leaked/extracted system prompts and model configs of popular AI coding tools, this link points at the Amp entry specifically. The Amp folder holds separate claude-4-sonnet.yaml and gpt-5.yaml configs plus a thread screenshot, exposing Amp's multi-model backend switching in a repo with 142k stars.",
      },
      {
        title: "Hegelian dialectic skill",
        href: "https://github.com/KyleAMathews/hegelian-dialectic-skill",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skill that automates deep reasoning by spawning two agents to fully embody opposing positions on a topic ('Electric Monks'), then decomposes both arguments and synthesizes a richer, non-binary conclusion. 562 GitHub stars and MIT licensed; runs a seven-phase process needing 10-15 minutes per round across multiple rounds for real depth.",
      },
      {
        title: "c0da",
        href: "https://c0da.org/",
        dateAdded: "2026-07-14",
        description:
          "Feminist research and publishing platform exploring the intersection of feminist writing and the history of women in coding, commissioned essays and artworks on programming's overlooked female history. Conceived by artist Katrin Mayer with programmer Anna Cairns, born from a 2020-2021 Berlin Artistic Research Programme grant.",
      },
      {
        title: "Ostralyan",
        href: "https://ostralyan.com/",
        dateAdded: "2026-07-14",
        description:
          "Interactive machine learning education platform: browser-based visualizations and live parameter tweaking across 25+ algorithms spanning neural networks, NLP, clustering and regression. Pulls real datasets from Hugging Face and scikit-learn instead of toy data, pairing each visualization with runnable code examples.",
      },
      {
        title: "Emil Kowalski skills",
        href: "https://github.com/emilkowalski/skills",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skills published by Emil Kowalski (Sonner/Vaul creator), packaging his interaction-design and animation craft as installable agent skills. Includes apple-design, a skill distilling Apple's WWDC talks on fluid motion and interface design specifically for web use.",
      },
      {
        title: "Matt Pocock skills",
        href: "https://github.com/mattpocock/skills",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skills published by Matt Pocock (Total TypeScript), packaging his TypeScript expertise as installable agent skills. Goes beyond TypeScript into full workflow tooling: wayfinder plans multi-session work and to-tickets breaks specs into dependency-tracked tracer bullets.",
      },
      {
        title: "David Ondrej skills",
        href: "https://github.com/davidondrej/skills",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skills published by David Ondrej, an AI-focused content creator. 2.6k stars, MIT-licensed, organized into five categories: agent orchestration, skill authoring, research, docs, and ops/setup.",
      },
      {
        title: "Building a web search engine from scratch",
        href: "https://blog.wilsonl.in/search-engine/",
        dateAdded: "2026-07-14",
        description:
          "Detailed, widely shared technical writeup on building a real web search engine from the ground up: crawling, indexing, ranking and the infrastructure decisions at each stage. Solo author Wilson Lin indexed 280 million pages in 2 months using 200 GPUs and 3 billion SBERT embeddings, at roughly $150/month on Hetzner.",
      },
      {
        title: "Orama",
        href: "https://github.com/oramasearch/orama",
        dateAdded: "2026-07-14",
        description:
          "Fast, full-text and vector open-source search engine written in TypeScript, runs in the browser, Node or at the edge, popular as a lightweight Algolia/Elasticsearch alternative. 10.5k stars, Apache 2.0, ships the full engine (full-text, vector, hybrid, RAG) at under 2kb with typo tolerance across 30 languages.",
      },
      {
        title: "Streamdown",
        href: "https://streamdown.ai/",
        dateAdded: "2026-07-14",
        description:
          "Markdown renderer built specifically for streaming AI model output: typography, syntax highlighting and animation handle text arriving incrementally, with optional math and diagram plugins. Built by Vercel; ships as modular packages (streamdown plus @streamdown/mermaid, @streamdown/math, @streamdown/code) and is used in production by Supabase and Cloudflare.",
      },
      {
        title: "code-chunk",
        href: "https://github.com/supermemoryai/code-chunk/blob/main/packages/code-chunk/src/chunker.ts",
        dateAdded: "2026-07-14",
        description:
          "Chunking utility from Supermemory AI for splitting source code into semantically meaningful pieces, used for feeding code into embeddings/RAG pipelines without breaking mid-function. Uses Tree-sitter for AST-aware splitting across six languages (TS, JS, Python, Rust, Go, Java); 202 stars.",
      },
      {
        title: "integrations.sh",
        href: "https://integrations.sh/",
        dateAdded: "2026-07-14",
        description:
          "Registry of 5,758+ publicly accessible integration specs across MCP, OpenAPI and GraphQL, letting AI agents discover and connect to third-party services from one catalog. Built by Useful Software Co.; the catalog spans 3,230 domains, breaking down to 3,806 API, 1,274 MCP, 565 CLI, and 113 GraphQL specs.",
      },
      {
        title: "Boring Computers",
        href: "https://boringcomputers.com/",
        dateAdded: "2026-07-14",
        description:
          "Open-source platform providing instant Firecracker microVMs, a terminal, a real browser and preinstalled coding agents driven by an AI, self-hostable with your own Anthropic and S3 keys. Built by Michael Shimeles under Apache-2.0, it boots snapshotted microVMs in roughly 3ms so agents can resume mid-session almost instantly.",
      },
      {
        title: "v0",
        href: "https://v0.app",
        dateAdded: "2026-07-15",
        description:
          "Vercel's text-to-app generator: describe a UI or product in prompts and get a working Next.js/Tailwind app back, with a sandboxed runtime and native GitHub branches/PRs. Vercel's public template gallery shows real usage scale, e.g. a top landing-page template alone logged over 20,000 remixes and 1,800 likes.",
      },
      {
        title: "Cursor Directory",
        href: "https://cursor.directory",
        dateAdded: "2026-07-15",
        description:
          "Directory of Cursor .cursorrules and community plugins for tuning AI pair-programming behavior per language and framework. Beyond rules, it runs a jobs board where developers list themselves as available for hire as Cursor-focused freelancers.",
      },
      {
        title: "Languine",
        href: "https://languine.ai",
        dateAdded: "2026-07-15",
        description:
          "AI-powered CLI for app localization, built on the Vercel AI SDK, detects changed translation keys via git diff instead of re-translating everything. Free CLI aside, its Pro tier adds CI/CD workflow automation via GitHub Actions and covers 10+ formats including Flutter ARB and XLIFF.",
      },
      {
        title: "3D Model Generator",
        href: "https://3d-model-generator.ctate.dev",
        dateAdded: "2026-07-15",
        description:
          "AI tool that generates 3D models from a prompt via Hyper3D Rodin, by Chris Tate (ctate.dev). Powered by Rodin's text-to-3D and image-to-3D endpoints, so outputs come as textured, game-ready GLB meshes, not bare untextured geometry.",
      },
    ],
  },
  {
    title: "AI agent platforms and infrastructure",
    links: [
      {
        title: "Orca",
        href: "https://www.onorca.dev/",
        dateAdded: "2026-09-02",
        kind: "tool",
        stack: ["electron", "git", "mcp"],
        useFor: [
          "parallel agents",
          "run coding agents",
          "git worktree agents",
          "agent orchestrator",
          "manage multiple agents",
          "agent development environment",
        ],
        description:
          "Agent development environment from Stably AI for running many CLI coding agents at once, each pinned to its own real git worktree so they cannot collide. Its comparison table claims 27 supported agents, among them Claude Code, Codex, Gemini, Grok, Cursor, Copilot, OpenCode, Amp, Goose and Cline, all running on your own subscriptions. The workbench pairs a GPU-rendered terminal with an embedded Chromium tab per worktree and a Monaco editor, plus an in-app diff viewer whose inline annotations go back to the agent, and GitHub and Linear integrations. Free and MIT licensed, native on macOS, Windows and Linux with iOS and Android companions, and it runs locally, over SSH, on an always-on server or a fresh cloud VM.",
      },
      {
        title: "Closing the AI agent trust gap with graduated autonomy",
        href: "https://aws.amazon.com/blogs/architecture/closing-the-ai-agent-trust-gap-with-graduated-autonomy/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["agents", "aws", "bedrock", "cedar", "dynamodb", "permissions"],
        useFor: [
          "agent permissions",
          "graduated autonomy",
          "agent trust",
          "gate agent actions",
          "agent approval tiers",
          "limit what an agent can do",
          "agent audit trail",
          "agent guardrails",
          "human in the loop approval",
          "score agent reliability",
        ],
        description:
          "AWS Architecture Blog post from 26 August 2026 by Dev Arora, Meera Kezhukoot and Sathish Kumar Prabakaran, arguing that the usual choice between full access and read-only fails because identity-based permissions are granted once at provisioning while LLM agents behave inconsistently. The proposal is graduated autonomy: an agent earns permissions through demonstrated reliability and loses them when performance slips, scored 0 to 100 over a rolling 50-action window across accuracy (25%), safety (20%), consistency (20%), compliance (20%) and efficiency (15%). Four tiers run from T1 Probation (0 to 40, read and list only, two tools visible) through T2 Supervised and T3 Trusted to T4 Autonomous (91 to 100, full access with post-hoc audit), with hysteresis that promotes only 5 points above a tier floor but demotes at the floor itself, so agents cannot flap. The build is specific enough to copy: Bedrock AgentCore, Cedar policies with forbid-wins semantics enforced outside the agent process, Bedrock Guardrails, DynamoDB for trust state and audit records, and a CodePipeline gate that blocks release on a single unauthorized tool call in adversarial tests. Sharp details throughout, including synthetic honeypots validated on tool-call trajectory rather than natural-language output, double penalties for overconfident failures, an operator rejection rate of 30% capping the safety score at 70, an emergency stop that deploys one Cedar deny-all policy, and a delegated action inheriting the minimum tier across the chain.",
      },
      {
        title: "Letta",
        href: "https://www.letta.com/",
        dateAdded: "2026-08-18",
        stack: ["llm"],
        useFor: [
          "agent memory",
          "long term memory agent",
          "stateful agents",
          "memgpt",
          "continual learning agent",
          "sleep time compute",
          "context management",
        ],
        description:
          "Research lab and product from the creators of MemGPT at UC Berkeley's Sky Computing Lab, working on agents whose memory, identity and capabilities carry across sessions instead of resetting every run. The shipped piece is Letta Agent, installed with npm i -g @letta-ai/letta-code, with Bilt, 11x, Kognitos and Hunt Club as named case studies. The research trail is the more useful half: MemGPT and virtual context management (Oct 2023), sleep-time compute so agents reason during idle time rather than at inference (Apr 2025), continual learning in token space (Dec 2025), git-based context repositories (Feb 2026), a context constitution (Apr 2026) and memory models trained with memory-native RL (Jun 2026). Advised by Ion Stoica and Joey Gonzalez; no pricing, license or benchmarks are stated on the site.",
      },
      {
        title: "Plannotator",
        href: "https://plannotator.ai/",
        dateAdded: "2026-08-12",
        kind: "tool",
        stack: ["agents", "claude-code", "codex", "code-review", "git"],
        useFor: [
          "review agent plans",
          "annotate a plan",
          "plan mode review",
          "review agent diffs",
          "comment on agent output",
          "give feedback to an agent",
          "local diff viewer",
          "code review for agents",
        ],
        description:
          "Local review surface that sits between you and a coding agent, for the moment a plan comes back and you want to change three lines of it rather than retype the whole thing. You select text in the proposed plan to mark deletions, add inline comments or write replacements, and the structured result goes straight back to the agent; plan review hooks the agent's plan step automatically, and slash commands cover the rest, with /plannotator-annotate for a file, folder or URL, /plannotator-review for local diffs or a GitHub or GitLab PR, and /plannotator-last for the agent's most recent message. Code review renders a PR-style diff over uncommitted changes with side-by-side or unified views, line-level annotations carrying code suggestions, and staging before commit. Built by backnotprop, dual-licensed MIT or Apache 2.0, installed with curl -fsSL https://plannotator.ai/install.sh | bash, running locally with no telemetry and listing Amp, Claude Code, Codex, Copilot, Droid, Gemini, Kiro, OpenCode and Pi plus VS Code, Obsidian and Bear integrations; a hosted Workspaces tier for shared plans and review history is waitlist only, with the local plugin staying free.",
      },
      {
        title: "Blume Sidecar",
        href: "https://blume.codes/",
        dateAdded: "2026-08-11",
        kind: "tool",
        stack: ["agents", "claude-code", "codex", "cursor", "desktop"],
        useFor: [
          "monitor coding agents",
          "watch multiple agents",
          "review agent changes",
          "agent oversight",
          "agent rules and hooks",
          "steering coding agents",
          "agent usage tracking",
        ],
        description:
          "Desktop app that sits beside your coding agents and shows what each one is doing, for when several run at once and steering them by watching terminals stops working. It tracks Cursor, Claude Code, Codex, omp and Pi in one Agents view with per run status, the git branch a run sits on, and the diff before it lands, and it surfaces the hidden files that shape agent behaviour: rules, hooks and skills. Conversation history is stored locally on your device. Shipping now are the agent overview, hidden files and rules, and usage tracking, with auto-fixes, analytics and a local domain model marked soon, and a central domain model, team conflict resolution and auto-improve mode marked next.",
      },
      {
        title: "ego (lite)",
        href: "https://lite.ego.app/",
        dateAdded: "2026-08-07",
        kind: "tool",
        stack: ["chromium", "cdp", "browser-automation", "agents"],
        useFor: [
          "browser for ai agents",
          "agent web automation",
          "logged in browser",
          "browser automation",
          "agent browser",
          "share browser session",
          "drive a real browser",
          "chrome profile",
        ],
        description:
          "Chromium browser you hand to a coding agent so it drives the web through sessions you are already logged into, rather than a clean headless profile. Onboarding installs an ego-browser skill into the agent's skill directory, after which the agent runs in-page JavaScript for snapshot, fill, click, wait, navigate and capture, batching several steps into one script instead of one tool call each; Spaces isolate agent tasks from your own tabs, and one click imports Chrome tabs, bookmarks, passwords, extensions and cookies. The snapshot lives in the custom Chromium engine rather than an injected shim, so it reaches cross-origin iframes, shadow DOM and third-party widgets such as Stripe and Intercom, addressing elements by stable @N refs. Built by Citro Labs, free, Mac only with a Windows signup, MIT at citrolabs/ego-lite with 9,100+ stars, and it claims complex tasks finish up to 3.45x faster than agent-browser on fewer tokens.",
      },
      {
        title: "Rivet",
        href: "https://rivet.dev/",
        dateAdded: "2026-08-07",
        kind: "library",
        stack: ["bun", "wasm", "agents"],
        useFor: [
          "durable actors",
          "actor per agent",
          "rivet actors",
          "agent scale to zero",
          "durable agent compute",
          "self host agents",
          "agent actor runtime",
          "stateful actor agents",
        ],
        description:
          "Open-source actor runtime for AI agents and realtime apps, used when you want durable stateful compute (one actor per agent, session, or user) inside an existing Node.js or Bun backend rather than a separate orchestrator. Actors keep state in memory, hibernate when idle, burst under load, and ship WebSockets, workflows, queues and timers; install with npm install rivetkit for local library mode, or run Rivet Cloud or a self-hosted engine (Docker, single Rust binary, Postgres, filesystem, or FoundationDB). Also ships agentOS, a Wasm virtual OS for agents without containers or VMs, with site claims of roughly 92x faster cold starts and 47x less memory than sandbox microVMs. Backed by Y Combinator and a16z Speedrun; clients for React, Next.js, Svelte, Hono, Express and tRPC.",
      },
      {
        title: "Kitesurf",
        href: "https://blog.cloudflare.com/kitesurf/",
        dateAdded: "2026-08-07",
        kind: "essay",
        stack: ["cloudflare", "workers", "wasm", "rust", "cdp", "agents"],
        useFor: [
          "agent browser",
          "agent first browser",
          "browser for agents",
          "headless browser agents",
          "browser on workers",
          "browser run kitesurf",
          "cheap agent browser",
          "cdp for agents",
        ],
        description:
          "Cloudflare launch post for Kitesurf, an agent-first browser that runs entirely on Workers V8 isolates, for screenshots, HTML extraction and automation without the memory cost of a full Chromium instance. Free in beta through Browser Run: point Puppeteer, Playwright or chrome-remote-interface at the CDP endpoint with browser=kitesurf, or hit quick-action screenshot and extract APIs the same way. Built in about twelve weeks from a May 2026 first commit, it splits Engine, PageScript and PageRenderer across isolates, parses markup and styles with Blitz and Stylo (Rust to Wasm), rasterizes via blitz-paint, and uses Boa for evals Workers cannot run natively. Claims 215,000+ Web Platform Tests passing, and on a 14-URL corpus about 3-7x less CPU and memory than Chromium for screenshot and HTML extraction, at roughly 1.7x slower wall time. Playground at kitesurf.cloudflare.app with Chrome DevTools injected; skips video, 3D canvas, bot-challenge TLS fingerprints and long authenticated sessions for now. Posted 2026-08-06 by Celso Martinho; open source planned later.",
      },
      {
        title: "nmemo",
        href: "https://nmemo.cloud/",
        dateAdded: "2026-08-05",
        kind: "tool",
        stack: ["slack", "notion", "github", "qdrant"],
        useFor: [
          "context layer for agents",
          "agent context retrieval",
          "context with citations",
          "prompt context package",
          "multi source retrieval",
          "token budget context",
          "inspect retrieval diagnostics",
        ],
        description:
          "Multi-source context engine for AI agents, used to select the evidence a task needs and return it as one inspectable prompt package instead of handing a model raw search results or an entire chat history. It connects documents, memory, Slack, Notion, GitHub and Qdrant, then exposes citations, source health, token usage, ranking scores and discarded results so developers can see why context was selected. Built by Nikhil Rajpurohit and currently in beta, it works through a Context API or SDK with getContext() and getContextFast(), leaving the model and agent framework in the application's control.",
      },
      {
        title: "CopilotKit Channels SDK",
        href: "https://github.com/CopilotKit/channels-sdk",
        dateAdded: "2026-08-05",
        stack: ["slack", "copilotkit", "ag-ui"],
        useFor: [
          "agent in slack",
          "bring my agent to slack",
          "slack block kit",
          "teams adaptive cards",
          "teams agent",
          "discord agent",
          "ag-ui",
          "human approval",
        ],
        description:
          "SDK for putting an existing AI agent into Slack, Microsoft Teams and Discord with native platform UI, so it answers where the conversation already happens instead of behind its own chat window. It takes any AG-UI-compatible agent, CopilotKit's built-in one plus LangGraph, CrewAI, Mastra, Pydantic AI and Google ADK, and renders through Slack Block Kit and Teams Adaptive Cards, covering streaming, tool calls, file handling and pausing for human approval. Install @copilotkit/channels alongside @copilotkit/runtime, which ship as a tested pair, then define a channel with createChannel and handle turns in onMessage through thread.runAgent; it needs Node 22 or later and a long-running process, plus a channel code and project API key from CopilotKit Intelligence, which owns platform credentials, ingress and reconnects and can be self-hosted for enterprise. MIT and early, at 31 stars and 43 commits with no tagged releases; the reference app is OpenTag, an on-call triage assistant on a Python LangGraph agent that asks for approval before writing to Linear or Notion.",
      },
      {
        title: "BackSearch",
        href: "https://www.gr.inc/releases/introducing-backsearch",
        dateAdded: "2026-07-25",
        description:
          "Search API that returns the web as it was archived on a chosen past date, so an agent can be backtested on a question without today's answers leaking in. Built by General Reasoning and released 24 July 2026: two endpoints, search and fetch, both taking an as_of date, gated on crawl date rather than publish date so backdated content cannot slip through, and deterministic, meaning the same query at the same as_of returns the same results forever. The preview covers news domains only from December 2025 to July 2026, billed pay-as-you-go at $10 per 1,000 searches and $2 per 1,000 fetches against an OpenReward balance, with failed requests free.",
      },
      {
        title: "wigolo",
        href: "https://github.com/KnockOutEZ/wigolo",
        dateAdded: "2026-07-21",
        description:
          "Local-first web intelligence server for AI agents: search, fetch, crawl, extract, cache, and research over MCP with no API keys, no cloud, and nothing per query, meant for coding agents that need web access without a paid search API. Built by Towhid (KnockOutEZ) mostly in TypeScript with a Python SDK, it runs an embedded browser engine, on-device embeddings, and ML reranking, needs Node 20+ and around 1.5 GB of disk, and exposes MCP plus REST and SDK interfaces to Claude Code, Cursor, and VS Code. Multi-engine search with rank fusion and byte-pinned verbatim excerpts, optional LLM synthesis via Gemini, OpenAI, Anthropic, Groq, or local Ollama, and works with LangChain, CrewAI, LlamaIndex, and the Vercel AI SDK. AGPL-3.0, around 2.9k stars.",
      },
      {
        title: "Cloudflare Artifacts",
        href: "https://blog.cloudflare.com/artifacts-git-for-agents-beta/",
        dateAdded: "2026-07-21",
        description:
          "Cloudflare's launch post for Artifacts, a versioned file system that speaks Git, built for agents that need to create repos programmatically rather than through a human-facing forge. Repos are created over a REST API or a Workers binding, can be imported or read-only forked from GitHub, and carry agent attribution in git-notes. The Git server is roughly 100KB of Zig compiled to WebAssembly running on Durable Objects, with R2 for snapshots and KV for auth tokens, speaking Git protocol v1 and v2 with shallow clones and incremental fetch. It also open-sources ArtifactFS, a filesystem driver that mounts large repos and hydrates files on demand. Pricing at announcement was $0.15 per 1,000 operations and $0.50 per GB-month, with a free tier of 10,000 operations and 1GB. Posted April 16, 2026 by Matt Carey and Matt Silverlock.",
      },
      {
        title: "Monid",
        href: "https://monid.ai/",
        dateAdded: "2026-07-21",
        description:
          "Tool catalog for AI agents, meant for when you want an agent to reach 1,300+ third-party APIs without wiring each integration yourself. Connects three ways: a one-line chat skill, a remote MCP server, or a CLI. Billing is pay-per-call against a single balance instead of per-tool subscriptions, quoted around $0.0013 a call with $1 of free credit, and the agent can discover and compare candidate tools ranked by fit and price before running one. Listed tools include Apollo, Exa, OpenWeather, Browserbase, and LinkedIn and YouTube scrapers. Built by Monid Inc in San Francisco; the site is still marked v0.1.0.",
      },
      {
        title: "VibeUI",
        href: "https://vibeui.online",
        dateAdded: "2026-07-14",
        description:
          "Library of 92 layout prompts across 15 categories (auth forms, pricing pages, hero sections, dashboards) meant to be copy-pasted into an AI coding tool like Claude or GPT to scaffold a UI. Prompts pair with the partner tool GlowUp UI, letting a scaffolded layout automatically match the visual style of a reference screenshot you supply.",
      },
      {
        title: "String",
        href: "https://string.com",
        dateAdded: "2026-07-14",
        description:
          "Platform for building and deploying AI agents that can operate autonomously. Pitches itself as developer infrastructure for wiring custom autonomous agent workflows, closer to an SDK/platform than a pre-built chatbot or research-agent product.",
      },
      {
        title: "Ship Studio",
        href: "https://www.ship.studio",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source desktop app that unifies AI coding agents (like Claude Code), GitHub and hosting platforms (like Vercel) into one workspace, so code and deploys stay in your own accounts with no vendor lock-in. Ships as a native Mac desktop app with a built-in 'tweak panel' for direct hand-edits that don't burn agent credits, unlike credit-metered AI IDEs.",
      },
      {
        title: "opencli",
        href: "https://opencli.info",
        dateAdded: "2026-07-14",
        description:
          "Gives a command-line interface or AI agent control of an already-logged-in browser session, so an agent can act on sites you're authenticated into instead of needing separate credentials. Its own tagline translates from Chinese as 'hand your already-logged-in browser to CLI and Agent,' framing it for the Chinese AI-agent tooling market.",
      },
      {
        title: "Flue Framework",
        href: "https://flueframework.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source TypeScript framework for building autonomous AI agents with built-in durability and recovery, aiming to write once, deploy anywhere, and work with any LLM. Built on Pi, the harness Flue says powers OpenClaw, with 40+ turnkey integrations spanning Slack, GitHub, Stripe, and Linear.",
      },
      {
        title: "Vercel Eve",
        href: "https://vercel.com/eve",
        dateAdded: "2026-07-14",
        description:
          "Vercel's framework for building AI agents, positioned as 'Next.js for agents': markdown for instructions and skills, TypeScript for tools, deployable to Slack, Discord and the web. Tool registration is zero-config: drop a TypeScript file in tools/, and its filename alone becomes the callable tool name.",
      },
      {
        title: "Conductor",
        href: "https://www.conductor.build",
        dateAdded: "2026-07-14",
        description:
          "Runs multiple parallel coding agents (Claude Code, Codex, Cursor) on your Mac in isolated workspaces, so you can monitor several at once and merge the results together. Currently a Mac-only native app (v0.76.0), built specifically so Claude Code, Codex, and Cursor can run side by side on one machine.",
      },
      {
        title: "Hyperframes",
        href: "https://github.com/heygen-com/hyperframes",
        dateAdded: "2026-07-14",
        description:
          "Open-source framework by HeyGen that converts HTML, CSS, media and animation into deterministic MP4 video, built for AI coding agents: write HTML, render video, with skills that automate the video-production workflow. Apache-2.0 licensed with 36k+ GitHub stars, renders via headless Chrome plus FFmpeg, and uses plain HTML instead of Remotion's React-based timeline.",
      },
      {
        title: "Blueberry",
        href: "https://www.meetblueberry.com",
        dateAdded: "2026-07-14",
        description:
          "AI-native product development platform that unifies a code editor, terminal, browser preview and canvas into one workspace, with Claude wired in to see your code, browser output and running app at once. Free during its current beta, with a built-in MCP server giving the AI live access to pinned apps like Linear, Figma, and PostHog.",
      },
      {
        title: "Lil Agents",
        href: "https://lilagents.xyz",
        dateAdded: "2026-07-14",
        description:
          "macOS app with two AI companions, Bruce and Jazz, that live above your dock with their own Claude sessions for chatting and coding, each with themes and visible thinking-status indicators. Made by solo developer Ryan Stephen; currently in beta (v1.2.2), macOS-only, and distributed as a GitHub release ZIP rather than the App Store.",
      },
      {
        title: "Feynman",
        href: "https://www.feynman.is",
        dateAdded: "2026-07-14",
        description:
          "Open-source AI research agent that reads papers, searches the web, writes research drafts, plans experiments and cites sources, with both a CLI and a local workbench app for notebooks and chat. Built by Companion (companion.ai), open source on GitHub, installs via a one-line curl script, and pulls in Exa, Perplexity, and Gemini for literature search.",
      },
      {
        title: "agentOS",
        href: "https://agentos-sdk.dev/",
        dateAdded: "2026-07-14",
        description:
          "Library that gives each agent its own virtual operating system (filesystem, process execution, orchestration) inside your existing backend, instead of renting a sandbox or VM per agent. Built by Rivet on WebAssembly and V8 isolates, Apache 2.0, Rust core, installed with npm install @rivet-dev/agentos. Its published benchmarks claim 4.8ms p50 cold starts against 440ms for E2B and roughly 22 MB per instance against a 1 GiB sandbox minimum, with methodology and reproduction steps linked. Runs Pi, Claude Code, Codex, and OpenCode on the same virtual OS, and can mount S3, SQLite, or the host filesystem as normal files.",
      },
      {
        title: "Agentation",
        href: "https://www.agentation.com",
        dateAdded: "2026-07-14",
        description:
          "Desktop tool that turns UI feedback into structured data for AI coding agents: click an element, add a note, and it packages the CSS selector and source path so an agent like Claude Code can make a targeted fix. Free for individuals, installs via npm install agentation, and was built by Benji Taylor, Dennis Jin, and Alex Vanderzon.",
      },
      {
        title: "aitmpl",
        href: "https://www.aitmpl.com",
        dateAdded: "2026-07-14",
        description:
          "Marketplace of ready-to-use Claude Code configurations, 1000+ agents, commands, skills and MCP integrations, with a Stack Builder for assembling a custom setup. Built by GitHub user davila7 and backed by Vercel, Neon, and Anthropic's Claude program, with trending and job-board sections too.",
      },
      {
        title: "pi.dev",
        href: "https://pi.dev",
        dateAdded: "2026-07-14",
        description:
          "Minimal agent harness for building customizable AI coding workflows via extensions and skills, working across 15+ model providers instead of locking you into one. Built by Earendil Inc. under the MIT license, and deliberately ships without MCP, sub-agents, or plan mode by default, add only what you need.",
      },
      {
        title: "Baudbot",
        href: "https://baudbot.ai",
        dateAdded: "2026-07-14",
        description:
          "Coding agent that lives in Slack and works your Linux server directly: message it a task and it creates branches, writes code and opens pull requests, running persistently and learning your codebase over time. Built by Modem; routes Slack events through a durable Cloudflare Worker broker so no task drops if your server restarts mid-run.",
      },
      {
        title: "Promptfoo",
        href: "https://www.promptfoo.dev",
        dateAdded: "2026-07-14",
        description:
          "Open-source tool for testing and evaluating LLM prompts, running them against test cases and models to catch regressions before shipping a prompt change. 23.4k GitHub stars and 300,000+ users including teams at OpenAI and Anthropic; recently acquired by OpenAI, SOC2 and ISO 27001 certified.",
      },
      {
        title: "Design Prompts",
        href: "https://www.designprompts.dev",
        dateAdded: "2026-07-14",
        description:
          "AI-powered design style explorer with curated prompts for generating different visual directions and creative styles. Renders 31+ distinct design styles from the exact same underlying data, so you can compare aesthetics apples-to-apples before picking one.",
      },
      {
        title: "Actors.dev",
        href: "https://actors.dev",
        dateAdded: "2026-07-14",
        description:
          "Communication platform giving AI agents their own email addresses, mailboxes, phone calls and webhook forwarding. Note: shutting down permanently on August 11, 2026, with all API access ending that date. Built solo by Ben Orenstein (@r00k); registrations are already closed ahead of the August 11, 2026 shutdown, so existing users only.",
      },
      {
        title: "AgentCard",
        href: "https://agentcard.sh",
        dateAdded: "2026-07-14",
        description:
          "Issues single-use virtual Visa cards to AI agents with fixed, scoped budgets so they can make real purchases online, integrating natively with Claude and other MCP clients. Tiered pricing runs free (5 cards/month, $50 cap) up to Pro at $100/month for 50 cards up to $1,000 each, plus a Chrome checkout-autofill extension.",
      },
      {
        title: "iocaihost",
        href: "https://iocaihost.com",
        dateAdded: "2026-07-14",
        description:
          "No-account static site hosting built for AI agents: a simple REST API lets an agent claim a slug and deploy HTML from templates like portfolios or storefronts, with restrictions against scripts and malicious content. Deploys cap at 2MB and are authenticated with your own OpenAI or Anthropic API key instead of a hosting account, across 9 built-in templates.",
      },
      {
        title: "entire.io",
        href: "https://entire.io",
        dateAdded: "2026-07-14",
        description:
          "Developer platform that logs every agent session, prompt and tool call alongside your git commits as searchable checkpoints, plus a distributed Git network with regional mirrors so agents can clone repos fast without rate limits. Open source under MIT, benchmarked around 2.1 million pushes/hour across 128 simulated agents, with automatic secret redaction before data leaves your machine.",
      },
      {
        title: "Cloudflare Sandbox",
        href: "https://sandbox.cloudflare.com",
        dateAdded: "2026-07-14",
        description:
          "Runs untrusted code in isolated Cloudflare Workers sandboxes, useful for safely executing AI-generated or user-submitted code. Layers Workers over Durable Objects over full Ubuntu Linux containers preloaded with Python, Node.js, and Git, multiplexing calls over one persistent WebSocket via RPC transport.",
      },
      {
        title: "Agents View",
        href: "https://www.agentsview.io",
        dateAdded: "2026-07-14",
        description:
          "Dashboard for monitoring AI agent activity across a fleet of running agents. Runs entirely local on SQLite with no accounts or cloud backend, parsing session files straight off disk into 8 summary cards including cache-hit rate.",
      },
      {
        title: "Sparkbites",
        href: "https://sparkbites.dev",
        dateAdded: "2026-07-14",
        description:
          "Curated design inspiration directory covering 270+ sites, decoding each one's fonts, colors and tech stack specifically for AI agents to reference, with an MCP server for pulling the data into Claude or Cursor. Built by @educalvolpz; the MCP server now spans 500+ sites, each with a downloadable DESIGN.md you can drop straight into a project.",
      },
      {
        title: "agent-browser",
        href: "https://github.com/vercel-labs/agent-browser",
        dateAdded: "2026-07-15",
        description:
          "Browser automation CLI from Vercel Labs built for AI agents to drive a real browser session. Ships as a Rust binary (85%+ of the codebase) with no Node.js daemon, and clicks elements via accessibility-tree refs like @e1 instead of CSS selectors.",
      },
      {
        title: "ralph-loop-agent",
        href: "https://github.com/vercel-labs/ralph-loop-agent",
        dateAdded: "2026-07-15",
        description:
          'Experimental framework from Vercel Labs that wraps the AI SDK with outer iteration logic, running an autonomous agent loop until a verification function confirms the task is done, with stop conditions by iteration count, token budget or cost. Named for the "Ralph Wiggum technique" (Ralph is just a bash loop); sits at 821 GitHub stars under an Apache-2.0 license.',
      },
      {
        title: "Zero",
        href: "https://zerolang.ai",
        dateAdded: "2026-07-15",
        description:
          'Experimental programming language where the graph is the program instead of text files: agents query a semantic graph, submit compiler-checked edits, and humans review the changes as a readable projection. Every proposed edit is checked against graph hashes for stale-state before it touches the store, and reviewers see it back as a plain ".0" file, not raw graph data.',
      },
      {
        title: "OpenUI Spec",
        href: "https://openuispec.org",
        dateAdded: "2026-07-15",
        description:
          "AI-native specification for describing UIs, aimed at giving agents a structured format to generate and reason about interfaces instead of raw markup. Created by Chris Tate, it's YAML-based (not JSON) and already ships example mappings for shadcn/ui, Material UI, Chakra UI, and Spectrum.",
      },
      {
        title: "Tooly",
        href: "https://tooly.ctate.dev",
        dateAdded: "2026-07-15",
        description:
          "Packages popular APIs (GitHub, Stripe, Linear, Notion) as ready-made AI SDK/agent tools, by Chris Tate (ctate.dev). Ships 12+ scoped packages like @tooly/github and @tooly/stripe, each bundling auth, rate limiting, and error handling out of the box.",
      },
      {
        title: "Executor",
        href: "https://github.com/UsefulSoftwareCo/executor",
        dateAdded: "2026-07-15",
        description:
          "Integration layer for AI agents: lets an agent call any OpenAPI, MCP, GraphQL or custom JS function inside a secure sandboxed environment, by Rhys Sullivan. Has 2.7k GitHub stars and runs code through QuickJS, Deno subprocesses, or dynamic workers inside a Bun/Turborepo monorepo.",
      },
      {
        title: "Vercel AI SDK",
        href: "https://vercel.com/docs/ai-sdk",
        dateAdded: "2026-07-15",
        description:
          "TypeScript SDK unifying LLM provider APIs (OpenAI, Anthropic, Google and others) behind one streaming and tool-calling interface, one of the most widely used AI libraries in the JS ecosystem. Swapping providers is literally a two-line diff, e.g. from 'openai/gpt-5.2' to 'anthropic/claude-opus-4.5' in the same generateText call.",
      },
      {
        title: "shadcn AI SDK helpers",
        href: "https://ui.shadcn.com/docs/helpers/ai-sdk",
        dateAdded: "2026-07-15",
        description:
          "Helpers for creating AI SDK messages and streaming predefined useChat conversations without a model, API route, network request or API key, useful for UI demos and deterministic tests. Its createChat().user().assistant() fluent API scripts multi-turn conversations, then transport() feeds them straight into useChat as a ChatTransport.",
      },
      {
        title: "Vercel Sandbox",
        href: "https://vercel.com/docs/sandbox",
        dateAdded: "2026-07-15",
        description:
          "MicroVM compute primitive for running untrusted or agent-generated code with persistent filesystem state, available through the standard Vercel CLI. Each sandbox is its own Firecracker microVM that boots in milliseconds and offers node26/24/22 or python3.13 with full root/sudo access. As of August 5, 2026 the Pro and Enterprise default quota rose from 2,000 to 10,000 concurrent sandboxes, and the vCPU allocation rate became dynamic: it starts at 150 vCPUs per minute and climbs by 500 per minute as you keep creating sandboxes, up to 5,000 per minute.",
      },
      {
        title: "Cloudflare Workers AI and AI Gateway",
        href: "https://developers.cloudflare.com/workers-ai/",
        dateAdded: "2026-07-15",
        description:
          "Inference at the edge plus a unified gateway across 14+ LLM providers, for routing, caching and logging AI requests from one place. Workers AI meters usage in Neurons with a daily free tier, while AI Gateway layers per-request analytics and rate limiting on top of routed calls.",
      },
      {
        title: "Cloudflare Agents SDK",
        href: "https://developers.cloudflare.com/agents/",
        dateAdded: "2026-07-15",
        description:
          "JavaScript framework for building persistent, stateful AI agents on Cloudflare Workers, used as the runtime other agent frameworks build on top of. Each agent instance gets its own embedded SQL database for state, and Cloudflare claims the runtime scales to tens of millions of concurrent agents.",
      },
      {
        title: "Polylane",
        href: "https://polylane.com/",
        dateAdded: "2026-07-19",
        description:
          "AI agents that read your code and watch your infrastructure to investigate production incidents and open pull requests with fixes, aimed at cutting down on-call load. Founded by Boris Tane, ex-Cloudflare engineer and Baselime founder, Polylane also integrates AWS, Kubernetes, Datadog, and Sentry to trace incidents through infra.",
      },
    ],
  },
  {
    title: "Backend engineering",
    links: [
      {
        title: "Sent",
        href: "https://www.sent.dm/en",
        dateAdded: "2026-08-07",
        kind: "library",
        stack: ["messaging", "sms", "whatsapp", "rcs", "api"],
        useFor: [
          "send sms",
          "sms api",
          "whatsapp api",
          "whatsapp business",
          "send whatsapp messages",
          "sms notifications",
          "rcs messaging",
          "messaging api",
          "twilio alternative",
          "send otp",
          "10dlc",
        ],
        description:
          "Unified messaging API that reaches users over SMS, WhatsApp and RCS through one integration, routing each message to the channel most likely to land and falling back automatically when one fails. The useful part is what you would otherwise build yourself: a contact object holding per-channel preferences, a pre-send availability check, one template that renders to channel-specific payloads, and automated 10DLC registration plus WhatsApp template submission with auto-resubmit on rejection. Founded in 2024 by Daniel Vataj and Betim Drenica, Sent is an FCC-registered carrier with direct interconnects rather than a reseller, and raised a $12M Series A led by Companyon Ventures in July 2026. SDKs for TypeScript, Python, Java, C#, Go, PHP and Ruby; pricing is $0.015 per contact per month with carrier fees passed through at cost.",
      },
      {
        title: "Next.js WebSocket upgrade in route handlers",
        href: "https://github.com/vercel/next.js/discussions/95514",
        dateAdded: "2026-07-15",
        description:
          "RFC for NextResponse.upgrade(), the first native way to handle WebSocket connections directly in a Next.js route handler with open/message/close/error hooks, powered by crossws with an API similar to Bun's. Proposed by Next.js core developer Tim Neutkens, it pins CrossWS 0.4.4 and explicitly excludes Vercel serverless and Edge runtime, self-hosted Node.js only.",
      },
      {
        title: "Laws of Software Engineering",
        href: "https://lawsofsoftwareengineering.com/",
        dateAdded: "2026-07-14",
        description:
          "Collection of named laws, heuristics and adages about software engineering (Conway's Law, Hyrum's Law and similar), a quick-reference for the rules of thumb the field keeps rediscovering. Built by Milan Milanović of the TechWorld with Milan newsletter, it currently catalogs 56 named laws and is licensed CC BY-NC-ND, not for reuse.",
      },
      {
        title: "The hidden performance cost of Node and GraphQL",
        href: "https://www.softwareatscale.dev/p/the-hidden-performance-cost-of-nodejs",
        dateAdded: "2026-07-14",
        description:
          "Deep dive on performance pitfalls that show up specifically when running GraphQL servers on Node.js at scale, and how to avoid them. By Utsav Shah: benchmarks show GraphQL's promise-per-field resolution alone causes a 2-3x latency hit, and APM tracing like dd-trace adds another 3-3.5x.",
      },
      {
        title: "Systems Engineering",
        href: "https://www.ashpreetbedi.com/articles/systems-engineering",
        dateAdded: "2026-07-14",
        description:
          "Essay on systems engineering thinking applied to software: designing for the whole system's behavior, not just individual components. Author Ashpreet Bedi builds this on Agno, his open-source agent framework, using the multi-agent Dash data assistant as the running example.",
      },
      {
        title: "The many JavaScript runtimes of the last decade",
        href: "https://buttondown.com/whatever_jamie/archive/the-many-many-many-javascript-runtimes-of-the-last-decade/",
        dateAdded: "2026-07-14",
        description:
          "Retrospective tour of the JavaScript runtime landscape over the past decade, Node, Deno, Bun and the rest, and how we ended up with so many. Notes Deno raised $4.9M then a $21M Series A while Bun took $7M, and by 2025 React Native ran 30 of the top 100 iOS apps.",
      },
      {
        title: "Serverless Horrors",
        href: "https://serverlesshorrors.com/",
        dateAdded: "2026-07-14",
        description:
          "Collection of real-world serverless horror stories, cautionary tales of cost blowups, cold-start disasters and architecture gone wrong. A crowdsourced feed of raw screenshots and incident tweets rather than written postmortems, so you see the panic before the analysis.",
      },
      {
        title: "V8 research grant",
        href: "https://v8.dev/grant",
        dateAdded: "2026-07-14",
        description:
          "Official V8 team page describing their research grant program for academic and open-source work related to the V8 JavaScript engine. Grants up to $40,000 as an unrestricted gift with no IP strings attached, but requires a Google V8 team member to co-sponsor the proposal first.",
      },
      {
        title: "Tech Vault",
        href: "https://github.com/moabukar/tech-vault/",
        dateAdded: "2026-07-14",
        description:
          "GitHub repository collecting curated technical resources and notes across backend, infrastructure and systems topics. Maintained by moabukar with 3.4k GitHub stars and 759 forks, plus a CLI and a random-question generator for drilling interview prep.",
      },
      {
        title: "Refactoring and Design Patterns",
        href: "https://refactoring.guru/",
        dateAdded: "2026-07-14",
        description:
          "Extremely well-known reference site cataloging classic design patterns and refactoring techniques with clear diagrams and code examples in multiple languages. Runs on 23 patterns (5 creational, 7 structural, 11 behavioral) with code in 10 languages, built solo by Alexander Shvets.",
      },
      {
        title: "JWT anatomy",
        href: "https://rmrf.tips/en/posts/jwt-anatomy/",
        dateAdded: "2026-07-14",
        description:
          "Breaks down the structure of a JSON Web Token piece by piece, header, payload and signature, and what each part actually does. Goes past the basics into attack surface: kid/jku/jwk header injection, duplicate-key parser differentials, and the 2038 exp overflow bug.",
      },
      {
        title: "Understanding Streams in Node.js",
        href: "https://nodesource.com/blog/understanding-streams-in-nodejs",
        dateAdded: "2026-07-14",
        description:
          "NodeSource guide to Node.js streams: readable, writable, duplex and transform streams, and when to reach for each. Written by Lizz Parody, it pushes readers toward stream.pipeline() (Node 10+) over manual .pipe() chains for safer error handling.",
      },
      {
        title: "What Node.js is",
        href: "https://www.thenodebook.com/node-arch/what-is-nodejs",
        dateAdded: "2026-07-14",
        description:
          "Foundational explainer on Node.js's architecture: the event loop, libuv and how it achieves non-blocking I/O. From Ishtmeet Singh's NodeBook (Sept 2025, targeting Node 22/24), it pins libuv's thread pool default at 4 threads, tunable up to 1024 via UV_THREADPOOL_SIZE.",
      },
      {
        title: "SSE vs WebSockets",
        href: "https://neciudan.dev/sse-vs-websockets",
        dateAdded: "2026-07-14",
        description:
          "Comparison of Server-Sent Events and WebSockets for real-time features, covering when the simpler one-way SSE is enough versus needing full duplex WebSockets. Notes that HTTP/1.1 caps browsers at six concurrent connections per domain, a real gotcha for SSE before HTTP/2 multiplexing fixes it.",
      },
      {
        title: "Server survival",
        href: "https://github.com/pshenok/server-survival",
        dateAdded: "2026-07-14",
        description:
          "Interactive 3D tower-defense game that teaches cloud architecture through gameplay: build and scale infrastructure to handle traffic, manage budgets, defend against DDoS, and keep services healthy. Built with vanilla JS and Three.js, no build step, and has racked up 6.2k GitHub stars with 696 forks.",
      },
      {
        title: "Backend from first principles",
        href: "https://github.com/hanspaa2017108/backend-from-first-principles-sriniously",
        dateAdded: "2026-07-14",
        description:
          "Repository of notes following Sriniously's 'Backend from first principles' YouTube course, lecture-by-lecture writeups of backend fundamentals. Covers all 11 lectures of Sriniously's YouTube playlist, one folder per lecture, for anyone following along without watching video.",
      },
      {
        title: "tinbase",
        href: "https://www.tinbase.dev/",
        dateAdded: "2026-07-14",
        description:
          "Supabase-compatible backend that fits in a tin: a lightweight, open-source local dev stack running as a single process with real Postgres, works unchanged with the official supabase-js SDK, and can even run inside a browser tab. Ships as a single 58 MB executable that starts serving requests in about 2 seconds, built solo by Sanket Sahu.",
      },
      {
        title: "Arcjet",
        href: "https://arcjet.com",
        dateAdded: "2026-07-14",
        description:
          "Security-as-code SDK you drop into your app's own code: rate limiting, bot detection, and a WAF, configured in application logic instead of a separate infrastructure layer. Unlike most JS-only security SDKs, it also ships a Python package for FastAPI and Flask, not just Next.js and Node.",
      },
      {
        title: "Cap.js",
        href: "https://capjs.js.org",
        dateAdded: "2026-07-14",
        description:
          "Lightweight, privacy-friendly CAPTCHA alternative that avoids the tracking and heavy scripts of reCAPTCHA-style widgets. Ships a roughly 20KB client bundle versus hCaptcha's 600KB and reCAPTCHA's 500KB, pairing proof-of-work hashing with separate browser instrumentation checks.",
      },
      {
        title: "Trigger.dev",
        href: "https://trigger.dev",
        dateAdded: "2026-07-14",
        description:
          "Open-source background jobs and workflow platform for running long-running or scheduled tasks reliably outside the request/response cycle, with built-in retries and observability. Cal.com runs millions of workflows a month on Trigger.dev, which has passed 15.7k GitHub stars and a 5k-member Discord.",
      },
      {
        title: "Autumn",
        href: "https://useautumn.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source billing platform that sits alongside Stripe rather than replacing it, managing subscriptions, usage tracking, credits and feature entitlements through a simple API, aimed at AI startups with usage-based pricing. Already running in production at Mintlify, Firecrawl, and T3.chat, three of the more visible AI-native startups shipping usage-based pricing.",
      },
      {
        title: "MSW",
        href: "https://mswjs.io",
        dateAdded: "2026-07-14",
        description:
          "Mock Service Worker: intercepts real network requests at the browser/Node level for API mocking in tests and dev environments, so components hit realistic mocked responses instead of a mocked fetch function. Created by Artem Zakharchenko; the same interception layer works across the browser, Node, Storybook, and Cypress, not only Jest.",
      },
      {
        title: "Better Auth",
        href: "https://better-auth.com",
        dateAdded: "2026-07-15",
        description:
          "Framework-agnostic, self-hosted TypeScript authentication library configured entirely in code, with plugins for 2FA, SSO, SCIM and social login across Next.js, Nuxt, SvelteKit and 20+ other frameworks. Just announced as joining Vercel, and already run in production by OpenAI, Databricks, and Strapi.",
      },
      {
        title: "Cloudflare Queues",
        href: "https://developers.cloudflare.com/queues/",
        dateAdded: "2026-07-15",
        description:
          "Managed message queue for Cloudflare Workers with pull-based consumers, for offloading work from the request/response cycle. Caps individual messages at 128 KB and batches at 100 messages per sendBatch() call, with retention capped at 24 hours on the free tier versus 14 days on paid plans.",
      },
      {
        title: "The only scalable delete in Postgres is DROP TABLE",
        href: "https://planetscale.com/blog/the-only-scalable-delete-in-postgres-is-drop-table",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale post arguing large-scale DELETE statements degrade badly from MVCC bloat and vacuum pressure, and recommending table partitioning so bulk deletion becomes DROP TABLE or TRUNCATE instead. From PlanetScale's engineering blog, it notes plain DELETE only creates dead tuples that autovacuum must later reclaim, so a busy table can bloat faster than vacuum keeps up.",
      },
      {
        title: "Why we chose NanoIDs for PlanetScale's API",
        href: "https://planetscale.com/blog/why-we-chose-nanoids-for-planetscales-api",
        dateAdded: "2026-07-15",
        description:
          "Covers the ID-design tradeoff of keeping a BIGINT auto-increment as the clustered primary key while exposing a separate NanoID column as the public-facing identifier. Settles on 12-character IDs from a 36-character alphabet, giving roughly a 1% collision chance over about 35 years at 1,000 IDs generated per hour.",
      },
      {
        title: "Deadlocks and downtime",
        href: "https://planetscale.com/blog/deadlocks-and-downtime",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale walkthrough of how transaction lock contention escalates into full outages, and how retry logic plus traffic shaping prevents the cascade. Points to Postgres's one-second default deadlock_timeout and SQLSTATE 40P01 as the mechanics behind why a handful of stuck transactions can snowball into an outage.",
      },
    ],
  },
  {
    title: "Databases and storage",
    links: [
      {
        title: "pgbot",
        href: "https://pgbot.dev/",
        dateAdded: "2026-08-21",
        kind: "tool",
        stack: ["postgres", "go", "cli", "mcp"],
        useFor: [
          "postgres health check",
          "slow query analysis",
          "unused indexes",
          "database mcp server",
          "why is my database slow",
          "vacuum and autovacuum visibility",
          "read only database access",
        ],
        description:
          "Open-source Go CLI that inspects a Postgres database and reports what is healthy, what is broken and what to fix first, through pgbot inspect --full, pgbot indexes and pgbot tables. It covers connections, locks, cache hit ratio, replication and WAL, slow queries and regressions, index usage and missing indexes, vacuum activity and table growth, and pgbot ask 'why is it slow?' puts a model over those same findings. pgbot mcp serves it to Claude Code, Claude Desktop or Cursor over stdio as two deterministic read-only tools, inspect and unused_indexes, plus a diagnose prompt and a pgbot://baselines resource, with no model key involved on that path. Read-only by construction; connect directly to Supabase, Neon, RDS, DigitalOcean, Hetzner or PlanetScale, or run the agent inside your own network for Docker, Kubernetes and VPCs. Free, 265 stars at github.com/pgrundev/pgbot, though the site's docs and changelog links are still placeholders.",
      },
      {
        title: "turbopuffer",
        href: "https://turbopuffer.com/",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["vector", "search", "s3", "ai"],
        useFor: [
          "vector search database",
          "full text search object storage",
          "hybrid search",
          "cheap vector database",
          "s3 backed search",
          "semantic search production",
          "turbopuffer",
        ],
        description:
          "Vector and full-text search engine built from first principles on object storage (S3), with a memory and SSD cache in front, aimed at large AI and product search workloads at lower cost than traditional vector DBs. Claims production scale of 1T+ documents, 10M+ writes per second, and 25k+ queries per second, with sub-10ms p50 on warm namespaces in their published benchmarks, hybrid search, metadata filters, and copy-on-write namespace branching. Customers called out on the site include Notion, Linear, Anthropic, Cognition, Atlassian, and Ramp; docs cover vector, FTS, hybrid, write, and query APIs, with a public cost calculator and tpuf-benchmark on GitHub.",
      },
      {
        title: "MariaDB",
        href: "https://mariadb.com/",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["sql", "mysql", "database"],
        useFor: [
          "mariadb",
          "open source mysql compatible",
          "enterprise open source database",
          "mysql alternative",
          "managed mariadb cloud",
          "vector search sql",
          "high availability database",
        ],
        description:
          "Enterprise open-source relational database, MySQL-compatible, offered as Community Server, Enterprise Server, MaxScale proxy, and MariaDB Cloud for self-managed or fully managed deployments. Marketing numbers on the homepage: 3B+ downloads and use at 75% of Fortune 500 companies, with up to five-nines HA messaging and migration tooling from proprietary databases. Current lines called out include MariaDB Enterprise Platform 2026 (Exa analytics, native vector search, RAG and AI copilots), Enterprise Server 11.8, MaxScale 25.10, and Community Server 12.3. Headquartered in Milpitas, CA per the site schema.",
      },
      {
        title: "Databasemaxxing",
        href: "https://pthorpe92.dev/databasemaxxing/",
        dateAdded: "2026-07-14",
        description:
          "Post on pushing a single database as far as it can go before reaching for distributed/sharded architecture, in the spirit of the 'you're probably not Google' school of database advice. Written by Preston Thorpe (pthorpe92), it dissects SQLite's bytecode VM and 4KB WAL pages alongside Postgres/MySQL to make the single-node performance case concrete.",
      },
      {
        title: "High memory usage in Postgres is good",
        href: "https://planetscale.com/blog/high-memory-usage-in-postgres-is-good-actually",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale post arguing that Postgres using most of your server's RAM (via the OS page cache) is a healthy sign, not a leak, and explains why. Author Simeon Griggs notes RAM page-cache reads run roughly 1,000x faster than even a fast NVMe drive, explaining the payoff.",
      },
      {
        title: "Patterns for Postgres traffic control",
        href: "https://planetscale.com/blog/patterns-for-postgres-traffic-control",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale post on managing and shaping traffic to a Postgres database, connection limits, queueing and backpressure patterns to avoid overload. Skips PgBouncer entirely, instead detailing PlanetScale's native Traffic Control feature, which returns SQLSTATE 53000 when it blocks a query in Enforce mode.",
      },
      {
        title: "FokosDB",
        href: "https://www.lambrospetrou.com/articles/fokosdb/",
        dateAdded: "2026-07-14",
        description:
          "Writeup of a custom database built on Cloudflare Durable Objects with strong consistency and bottomless storage, using a B+tree partition topology with hash/range splits to scale throughput to millions of items while keeping strict consistency. By Lambros Petrou; load tests sustained 500 reads plus 500 writes per second at 30-50ms latency, with configs scaling to 500TB across a million partitions.",
      },
      {
        title: "Database connections and pooling",
        href: "https://sagarshiroya.dev/posts/database-connection-and-pooling",
        dateAdded: "2026-07-14",
        description:
          "Explains how database connections actually work and why pooling matters at scale, including sizing a pool with Little's Law and Kingman's Formula. Gives the concrete formula pool_size = (core_count x 2) + effective_spindle_count, yielding 9 connections for a 4-core SSD-backed box.",
      },
      {
        title: "MySQL for developers",
        href: "https://planetscale.com/learn/courses/mysql-for-developers/schema/introduction-to-schema",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale's free course on MySQL fundamentals for application developers, starting with schema design. Taught by Aaron Francis via short video-plus-text lessons (this one just 3:26), with the full course totaling around 469 minutes.",
      },
      {
        title: "IO devices and latency",
        href: "https://planetscale.com/blog/io-devices-and-latency",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale post on the real latency characteristics of different storage IO devices, and why that matters for database performance tuning. A round trip to a local NVMe SSD runs about 50 microseconds versus roughly 250 microseconds for network-attached EBS, a 5x gap.",
      },
      {
        title: "Postgres OLTP benchmarks",
        href: "https://benjdd.com/pg-oltp/",
        dateAdded: "2026-07-14",
        description:
          "Interactive benchmark archive of Postgres OLTP transactions-per-second performance across scales, types and modes, tracing performance changes across Postgres history. Built on Tomas Vondra's raw pgbench data, letting you filter TPS by scale, workload type, and mode across Postgres release history.",
      },
      {
        title: "How Agoda unified its data pipelines",
        href: "https://www.infoq.com/news/2026/01/agoda-unified-data-pipeline/",
        dateAdded: "2026-07-14",
        description:
          "InfoQ writeup on how Agoda consolidated its fragmented data pipeline infrastructure into a single unified system. The resulting FINUDP pipeline, built on Apache Spark, merged three separate teams' financial pipelines and cut runtime from 5 hours to 30 minutes.",
      },
      {
        title: "Agoda financial metrics uptime",
        href: "https://medium.com/agoda-engineering/how-agoda-enhanced-the-uptime-and-consistency-of-financial-metrics-ef7d54c4e4f0",
        dateAdded: "2026-07-14",
        description:
          "Agoda engineering post on how they improved the uptime and consistency of their financial metrics pipeline, a real-world reliability case study. Agoda hit 95.6% pipeline uptime against a 99.5% target using GoFresh staleness monitoring plus a three-tier email/Slack/NOC alert escalation.",
      },
      {
        title: "B-trees and database indexes",
        href: "https://planetscale.com/blog/btrees-and-database-indexes",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale explainer on how B-tree indexes actually work under the hood and why they're the default structure for database indexing. With InnoDB's default 16k page size, a node holds 682 keys, so a 3-level B+tree indexes over 317 million rows.",
      },
      {
        title: "Database transactions",
        href: "https://planetscale.com/blog/database-transactions",
        dateAdded: "2026-07-14",
        description:
          "PlanetScale explainer on database transactions: ACID guarantees, isolation levels, and what can go wrong when you don't understand them. Uses concrete xmin/xmax transaction-ID examples to show how Postgres MVCC tracks row visibility instead of MySQL-style undo logs.",
      },
      {
        title: "Managing Postgres connections",
        href: "https://brandur.org/postgres-connections",
        dateAdded: "2026-07-14",
        description:
          "Brandur Leach's well-known deep dive on how Postgres handles connections, why each one is relatively expensive, and practical strategies for managing connection count at scale. Notes each Postgres backend process starts around 5 MB and that huge pages (500x larger) can shrink per-connection page-table overhead.",
      },
      {
        title: "Solving the hot key problem",
        href: "https://ximedes.com/blog/solving-the-hot-key-problem",
        dateAdded: "2026-07-14",
        description:
          "Interview with TigerBeetle's CEO on the 'hot key' problem, the roughly-100-TPS-per-account ceiling most databases hit, and how TigerBeetle's design (built for financial transactions, NASA-grade safety standards) avoids it while keeping predictable latency. Cites Mojaloop's switch to TigerBeetle lifting Gates Foundation payment throughput from 78 TPS to over 2,000 TPS.",
      },
      {
        title: "airpipe",
        href: "https://github.com/sanyam-g/airpipe",
        dateAdded: "2026-07-14",
        description:
          "Lightweight data pipeline tool for moving and transforming data between sources without a heavyweight ETL platform. Go CLI/browser tool that tunnels transfers peer-to-peer over WebRTC, with a 10-minute mailbox relay if the receiver's offline.",
      },
      {
        title: "Azimutt",
        href: "https://azimutt.app",
        dateAdded: "2026-07-14",
        description:
          "Tool for exploring and documenting large, complex database schemas visually, built for schemas too big to reason about from raw SQL alone. Ships its own AML text DSL for fast schema authoring plus path-finding between tables that lack direct foreign keys.",
      },
      {
        title: "Typesense",
        href: "https://typesense.org",
        dateAdded: "2026-07-14",
        description:
          "Fast, open-source, typo-tolerant search engine built as a simpler self-hostable alternative to Algolia or Elasticsearch for site and app search. Processes over 10 billion searches a month across its cloud, backed by 25k GitHub stars and 25M+ Docker pulls.",
      },
      {
        title: "Chroma",
        href: "https://www.trychroma.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source embedding database for AI apps, the default vector store many RAG projects reach for when storing and querying embeddings. Built on object storage with tiered memory/SSD/S3 caching, hitting ~20ms p50 query latency at 100k vectors.",
      },
      {
        title: "Convex",
        href: "https://www.convex.dev",
        dateAdded: "2026-07-14",
        description:
          "Reactive backend platform with a built-in database: write server functions in TypeScript and get automatic real-time sync to the client, no separate API layer to hand-wire. Founded by ex-Dropbox engineers, including an MIT PhD who led Dropbox's exabyte-scale storage migration off S3.",
      },
      {
        title: "Drizzle ORM",
        href: "https://orm.drizzle.team",
        dateAdded: "2026-07-15",
        description:
          "TypeScript ORM with zero runtime dependencies and a SQL-like query builder, supporting Postgres, MySQL, SQLite and more, with drivers for serverless targets like Neon, Turso and Cloudflare D1. Ships Drizzle Studio, a bundled GUI for browsing and editing your schema and data with table/view creation built in.",
      },
      {
        title: "Cloudflare D1",
        href: "https://developers.cloudflare.com/d1/",
        dateAdded: "2026-07-15",
        description:
          "SQLite-based serverless SQL database on Cloudflare's edge network, designed to be sharded per-tenant rather than run as one central database. Includes Time Travel, letting you restore a database to any minute within the past 30 days without manual backups.",
      },
      {
        title: "Cloudflare R2",
        href: "https://developers.cloudflare.com/r2/",
        dateAdded: "2026-07-15",
        description:
          "S3-compatible object storage on Cloudflare with zero egress fees, a common pick for teams that got burned by S3 bandwidth bills. Integrates directly with Cloudflare Workers via native bindings, letting code read and write objects without presigned URLs or extra HTTP round trips.",
      },
      {
        title: "Cloudflare Hyperdrive",
        href: "https://developers.cloudflare.com/hyperdrive/",
        dateAdded: "2026-07-15",
        description:
          "Connection pooling and acceleration layer that sits in front of an existing Postgres or MySQL database, for querying it fast from Cloudflare Workers. Pools warm database connections and caches query results at Cloudflare's edge, avoiding the per-invocation TCP/TLS handshake cost of serverless Workers.",
      },
      {
        title: "Vercel Blob",
        href: "https://vercel.com/docs/storage/vercel-blob",
        dateAdded: "2026-07-15",
        description:
          "Managed object storage for file uploads served through a global CDN, the same storage this registry's own asset pipeline runs on. Runs on Amazon S3 underneath, rated 99.999999999% (eleven nines) durability, and recommends multipart uploads once a file passes 100 MB.",
      },
      {
        title: "Non-blocking schema changes",
        href: "https://planetscale.com/blog/non-blocking-schema-changes",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale explains how it avoids running raw DDL against production: build a shadow table, backfill rows in batches, and apply ongoing writes via binlog streaming before cutover. Pairs Vitess with GitHub's own gh-ost migration tool, and its conflict detection can save users up to a few days of queue wait.",
      },
      {
        title: "RLS sounds great until it isn't",
        href: "https://planetscale.com/blog/rls-sounds-great-until-it-isnt",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale details concrete failure modes of Postgres Row Level Security at scale: connection-pooler incompatibilities, planner cost blind spots, and per-query policy-evaluation overhead. Cites a concrete benchmark: an uncached RLS policy function can inflate Postgres's query cost estimate by more than 3x versus a cached InitPlan.",
      },
    ],
  },
  {
    title: "Infrastructure, observability and runtimes",
    links: [
      {
        title: "celld",
        href: "https://celld.dev/docs",
        dateAdded: "2026-08-19",
        kind: "library",
        stack: ["deno", "s3", "sqlite", "cloudflare", "durable-objects"],
        useFor: [
          "durable objects on your own servers",
          "self host durable objects",
          "stateful runtime",
          "per user sqlite",
          "run workers locally",
          "s3 backed state",
        ],
        description:
          "Deno's stateful distributed runtime: run server-side JavaScript on your own machines with shared state living in an S3-compatible bucket you own, against the same API Cloudflare Workers and Durable Objects expose. A cell is a named single-threaded mini-server with its own private SQLite database, moving between resident, hibernated and inactive, where inactive costs almost nothing because it is just a bucket object. Coordination is the interesting part: no membership protocol, no failure detector, no consensus service, just one atomic write granting ownership and RPO=0 replication, with nodes discovering each other through bucket leases. celld deploy consumes a compatible Wrangler project including module Workers, DO bindings and static assets. Roughly 1,000 resident cells per 8 GB node works out near five cents per cell per month. Apache-2.0 at denoland/celld; note that MinIO community, Backblaze B2, Hetzner and DigitalOcean Spaces do not qualify as backends.",
      },
      {
        title: "Vercel Container Registry",
        href: "https://vercel.com/changelog/introducing-vcr-vercel-container-registry",
        dateAdded: "2026-07-27",
        description:
          "Changelog post announcing VCR, an OCI compliant image registry hosted on Vercel infrastructure, for keeping container images next to the project that runs them instead of on a separate registry. Plain docker push, pull and tag work against vcr.vercel.com/team/project/repository:tag, repositories are unlimited per project and created on first push or from the dashboard, and authentication runs through project OIDC or an access token rather than separate registry credentials. Images consumed by Sandboxes and Functions are automatically optimized into precompiled snapshots. Announced 2026-06-30; the post leaves pricing, storage quotas and plan availability to the docs.",
      },
      {
        title: "Hark",
        href: "https://hark.ryan.ceo/",
        dateAdded: "2026-07-25",
        description:
          "Turns any webhook into an iOS push notification branded with its source, for getting CI, deploy, and service alerts on a phone without building an app. Point a service at the generated webhook URL and sign in to the Hark iOS app to register a device. The free tier covers 10,000 notifications per month and Pro is 8 dollars for 100,000, plus routing a webhook to specific device IDs instead of every active device. An idempotency key header collapses repeat deliveries, so a retrying sender does not fire the same alert twice. Built by Ryan Vogel.",
      },
      {
        title: "Domain SDK",
        href: "https://www.domain-sdk.dev/",
        dateAdded: "2026-07-16",
        description:
          "TypeScript library that gives one unified API for managing customer custom domains across hosting platforms like Vercel, Cloudflare, Railway, Render and Netlify, so you add, verify, monitor and remove domains without learning each provider's own implementation. Ships as @opencoredev/domain-sdk on npm and models domain readiness as separate routing, ownership, and certificate states, not one flag.",
      },
      {
        title: "Tracing a memory leak in an LRU cache",
        href: "https://blog.openresty.com/en/xray-casestudy-lua-lru/",
        dateAdded: "2026-07-14",
        description:
          "Case study of using OpenResty XRay to diagnose a memory leak caused by an oversized Lua LRU cache holding SSL certificate objects, memory analysis and flame graphs traced it to a specific table blocking garbage collection. Written by Yichun Zhang, OpenResty's creator; the trace found glibc allocations were 93% of memory versus just 2.4% from LuaJIT itself.",
      },
      {
        title: "OpenStatus",
        href: "https://www.openstatus.dev/",
        dateAdded: "2026-07-14",
        description:
          "Open-source uptime monitoring and status page platform, a self-hostable alternative to paid status-page SaaS. Built by a two-person bootstrapped team (Thibault and Max) and monitors from 28 regions across 3 cloud providers, packaged as an 8.5MB Docker image.",
      },
      {
        title: "Just use evlog",
        href: "https://www.justfuckinguseevlog.com/",
        dateAdded: "2026-07-14",
        description:
          "Blunt marketing site for evlog, a TypeScript-first structured logger: one JSON event per operation with full context instead of scattered log lines, zero transitive dependencies. Backs its rant with numbers: 1552 GitHub stars and a sampling claim of dropping 90% of info logs in prod while keeping 100% of errors.",
      },
      {
        title: "evlog",
        href: "https://www.evlog.dev/",
        dateAdded: "2026-07-14",
        description:
          "Main site for evlog, the modern TypeScript logger for scripts, libraries, jobs, edge and requests, with simple logging, wide-event context accumulation, and structured errors with actionable guidance. Claims only ~3 microseconds of overhead per request, benchmarking faster than pino, consola, and winston by its own published numbers.",
      },
      {
        title: "Workbench for BullMQ",
        href: "https://getworkbench.dev/",
        dateAdded: "2026-07-14",
        description:
          "Dashboard for inspecting, debugging and managing BullMQ job queues in real time, available as a native macOS app, embeddable Node integration, or standalone Docker container. Built by pontusab, MIT-licensed and fully open source, with FlowProducer DAG visualization to trace parent/child job relationships.",
      },
      {
        title: "A peek behind Colossus",
        href: "https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system",
        dateAdded: "2026-07-14",
        description:
          "Google Cloud blog post describing Colossus, Google's internal distributed file system that underpins most of its storage products, one of the few public looks at its design. Written by Google's Dean Hildebrand and Denis Serenyi (April 2021), it cites a single cluster scaling 100x beyond the largest GFS deployments.",
      },
      {
        title: "Brendan Gregg's blog",
        href: "https://www.brendangregg.com/blog/index.html",
        dateAdded: "2026-07-14",
        description:
          "Blog of Brendan Gregg, one of the most respected performance engineers in the industry (BPF, flame graphs, USE method), essential reading for systems performance work. Gregg invented the flame graph visualization in 2011 and co-authored the widely cited textbook Systems Performance, now in its 2nd edition.",
      },
      {
        title: "Perfetto UI",
        href: "https://ui.perfetto.dev/#!/query",
        dateAdded: "2026-07-14",
        description:
          "Google's web-based trace viewer and query tool for analyzing performance traces (Chrome, Android, Linux ftrace), this link opens its SQL-style trace query interface. Runs on Perfetto's embedded trace-processor engine, so you can query captured trace events with SQL instead of clicking through timeline filters.",
      },
      {
        title: "AWS serverless topics",
        href: "https://builder.aws.com/learn/topics/serverless",
        dateAdded: "2026-07-14",
        description:
          "AWS's own learning hub for serverless architecture topics: Lambda, event-driven design, and related patterns. Lives on AWS Builder Center, the hub AWS relaunched in 2024 to fold Skill Builder courses and community content into one learning site.",
      },
      {
        title: "Kubernetes, what I wish I knew",
        href: "https://aws.plainenglish.io/kubernetes-still-feels-weird-what-i-wish-i-knew-sooner-dd61b90463db",
        dateAdded: "2026-07-14",
        description:
          "Personal retrospective on the Kubernetes concepts that took longest to click, written for engineers who still find k8s confusing despite using it daily. Published under the community-run 'AWS in Plain English' Medium outlet rather than official docs, so it reads as peer war-stories, not vendor messaging.",
      },
      {
        title: "EC2 instances comparison",
        href: "https://instances.vantage.sh/",
        dateAdded: "2026-07-14",
        description:
          "Well-known, exhaustive comparison table of every AWS EC2 instance type, specs and pricing, side by side, for picking the right instance without digging through AWS docs. Covers AWS, Azure and GCP side by side (not just AWS) and lets you filter with && / || / ! expressions across vCPU, memory and storage type.",
      },
      {
        title: "Akamai blog",
        href: "https://www.akamai.com/blog",
        dateAdded: "2026-07-14",
        description:
          "Akamai's engineering and industry blog, covering CDN, security and infrastructure topics from one of the largest edge networks in the world. Recent posts cover Akamai powering and securing Anthropic's Claude Managed Agents, showing the blog tracks live AI-infrastructure partnerships, not just CDN news.",
      },
      {
        title: "here.now",
        href: "https://here.now",
        dateAdded: "2026-07-14",
        description:
          "Instant hosting for static sites, apps and files, built so an AI agent or a person can publish to a live URL with no account required. Offers temporary anonymous hosting or API-key-based permanent sites with access controls and analytics. No-signup sites auto-expire after exactly 24 hours; creating an API key upgrades you to permanent hosting plus private 'Drives' file storage.",
      },
      {
        title: "Supabase docs over SSH",
        href: "https://supabase.com/blog/supabase-docs-over-ssh",
        dateAdded: "2026-07-14",
        description:
          "Supabase engineering blog post on serving their documentation through an SSH terminal session, a novel way to browse docs without a browser. Built on 'just-bash,' Vercel's open-source TypeScript Bash emulator, so the SSH session runs in a sandboxed virtual filesystem with no real shell exposed.",
      },
      {
        title: "LowEndBox",
        href: "https://lowendbox.com",
        dateAdded: "2026-07-14",
        description:
          "Long-running blog of deals and reviews for cheap VPS hosting, a go-to for finding low-cost virtual servers. Running since 2008 and paired with its own LowEndTalk discussion forum, it's more a hosting-deals ecosystem than a single blog.",
      },
      {
        title: "OpenPanel",
        href: "https://openpanel.dev",
        dateAdded: "2026-07-14",
        description:
          "Open-source, privacy-friendly web analytics platform, a self-hostable alternative to Google Analytics or Mixpanel. Built by Carl Lindsvard with about 4.8k GitHub stars, it even ships an MCP server exposing 38 tools so Claude or Cursor can query your analytics directly.",
      },
      {
        title: "tunnl.gg",
        href: "https://tunnl.gg",
        dateAdded: "2026-07-14",
        description:
          "Exposes a local development server to the internet via a public URL, similar to ngrok, for testing webhooks or sharing a local build. Distinguishes itself mostly through its short .gg domain, a link worth pasting into a Slack message or reading aloud on a call.",
      },
      {
        title: "Cloudflare Workers",
        href: "https://developers.cloudflare.com/workers/",
        dateAdded: "2026-07-15",
        description:
          "V8-isolate-based edge compute platform officially supporting 18+ frameworks, one of the most widely deployed serverless runtimes. Isolates cold-start in low single-digit milliseconds, and the free tier alone covers 100,000 requests a day with no credit card required.",
      },
      {
        title: "Alchemy",
        href: "https://alchemy.run/",
        dateAdded: "2026-07-15",
        description:
          "TypeScript-native infrastructure as code for defining and deploying Cloudflare and AWS resources as ordinary async functions. Particularly useful for colocating a Worker, KV, queues, bindings, local development and observability in one typed alchemy.run.ts file. Built on the Effect framework with hot-reloads around 100ms against live cloud resources, and reaches past Cloudflare/AWS to PlanetScale, Neon, and Axiom.",
      },
      {
        title: "Cloudflare Durable Objects",
        href: "https://developers.cloudflare.com/durable-objects/",
        dateAdded: "2026-07-15",
        description:
          "Stateful serverless compute with strict serializability for global request ordering, the primitive that Cloudflare's own D1 and Queues are built on top of. SQLite-backed Durable Objects graduated out of beta and now ship on Cloudflare's free plan, not just paid tiers.",
      },
      {
        title: "Cloudflare Containers",
        href: "https://developers.cloudflare.com/containers/",
        dateAdded: "2026-07-15",
        description:
          "Runs full Linux container workloads deployed via wrangler, for workloads that don't fit the Workers isolate model. Requires the Workers Paid plan; a wrangler.toml field like max_instances caps how many container instances a Worker can spin up.",
      },
      {
        title: "Introducing Database Traffic Control",
        href: "https://planetscale.com/blog/introducing-database-traffic-control",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale's proxy-layer system that enforces real-time budgets on query traffic using leaky-bucket rate limiting, estimating per-query resource cost from the planner before execution. Ships a warn mode that shows which queries would get throttled before you flip enforcement on for real.",
      },
      {
        title: "EAS Build",
        href: "https://expo.dev/eas",
        dateAdded: "2026-07-15",
        description:
          "Expo's cloud service that compiles native iOS/Android builds without a local Xcode or Android Studio setup, configured through eas.json build profiles. Also builds bare (non-Expo-managed) React Native projects, running on Expo's own hosted macOS and Linux build fleet.",
      },
      {
        title: "EAS Update",
        href: "https://docs.expo.dev/eas-update/introduction/",
        dateAdded: "2026-07-15",
        description:
          "Ships JavaScript and asset changes over the air to already-installed Expo builds, bypassing App Store and Play Store review for non-native changes. Bills by monthly active user: one install counts once per cycle no matter how many updates it downloads.",
      },
      {
        title: "EAS Workflows",
        href: "https://docs.expo.dev/eas/workflows/get-started/",
        dateAdded: "2026-07-15",
        description:
          "YAML-defined CI/CD pipelines for build, test, submit and update jobs that run on EAS infrastructure and trigger on GitHub events. Config lives at .eas/workflows/build.yml or deploy.yml, and native fingerprinting detects when a full rebuild is actually needed versus an OTA update.",
      },
      {
        title: "EAS Observe",
        href: "https://expo.dev/blog/introducing-observe",
        dateAdded: "2026-07-15",
        description:
          "Expo's production performance monitoring in open beta, tracking cold and warm launch time, time to interactive and first render across real user sessions with per-release percentile breakdowns. Built by the same team behind EAS Build and Update, so performance data shows up right in the existing expo.dev dashboard with no separate SDK to wire up.",
      },
    ],
  },
  {
    title: "Distributed systems and computer science",
    links: [
      {
        title: "All Things Distributed",
        href: "https://www.allthingsdistributed.com/",
        dateAdded: "2026-08-29",
        kind: "essay",
        useFor: [
          "werner vogels blog",
          "distributed systems essays",
          "aws architecture writing",
          "scalable systems",
          "frugal architect",
          "lambda origin story",
        ],
        description:
          "Werner Vogels' long-running blog on building scalable distributed systems, the index rather than a single post. Featured pieces include the PR/FAQ that launched AWS Lambda, The Frugal Architect, and the Now Go Build episodes. Recent 2026 posts cover DuckDB and the changing physics of analytics (26 Aug), scalable control planes (4 Aug), S3 Files, Lambda's network, and Aurora DSQL. Use this when you want the feed. The April 2021 S3 strong-consistency write-up is already a separate entry.",
      },
      {
        title: "Git at any scale",
        href: "https://cursor.com/blog/git-at-any-scale",
        dateAdded: "2026-08-19",
        kind: "essay",
        stack: ["git", "s3", "storage"],
        useFor: [
          "git hosting at scale",
          "distributed git storage",
          "write ahead log design",
          "rendezvous hashing",
          "replication without consensus",
          "monorepo infrastructure",
        ],
        description:
          "Vicent Marti on why serving Git at scale is hard and what Cursor built instead, published August 2026. Opens with the history: Shawn Pearce's JGit on a DHT at Google, killed by clone performance, GitHub's failed run through NFS, GFS and DRBD before Spokes settled on three replicas synchronized by three-phase commit, and Azure DevOps putting packfiles in blob storage with refs in SQL Server. Continuity, their answer, makes a write-ahead log in S3 the primitive: packfiles hit local NVMe and S3 at once, no push is acknowledged before it is persisted, rendezvous hashing removes the routing database and leader election, and replicas stay current on conditional GETs against S3 ETags where a 304 averages under 10 ms. Benchmarks run to 100 replicas at 120 pushes per second on S3 Standard and over 300 on Express One Zone, where Git's own compaction becomes the bottleneck.",
      },
      {
        title: "GPS-01",
        href: "https://gps-01.dmytro.fyi/",
        dateAdded: "2026-08-19",
        kind: "demo",
        stack: ["visualization", "3d"],
        useFor: [
          "how gps works",
          "trilateration",
          "interactive explainer",
          "explain a math concept visually",
          "clock bias",
          "satellite positioning",
        ],
        description:
          "Interactive explainer by Dmytro Kondakov for why GPS needs four satellites rather than three, built as a clickable 3D globe you drop a receiver onto. Five steps: 24 satellites at 20,200 km each carrying an atomic clock, expanding signal wavefronts slowed roughly 60 times from the real 70 ms trip, then the failure case where a quartz receiver clock off by one microsecond moves each distance by about 300 m and the three-sphere fix lands 888 km away, then the four-equation solve for x, y, z and the bias b. A telemetry panel exposes the raw L1 signals and the solver outputs. Worth studying as a model for how to teach a concept through simulation instead of diagrams.",
      },
      {
        title: "Rocq Prover",
        href: "https://rocq-prover.org/",
        dateAdded: "2026-08-06",
        kind: "tool",
        useFor: [
          "theorem prover",
          "proof assistant",
          "formal verification",
          "dependently typed",
          "interactive theorem proving",
          "formal proofs",
          "program extraction",
          "mechanised reasoning",
        ],
        description:
          "Interactive theorem prover and dependently typed programming language for mechanised proofs in mathematics and computer science, formerly the Coq Proof Assistant. You write formal specifications and proofs that programs meet them, then extract executable OCaml or Haskell from those specs; the kernel is a small OCaml core with MetaRocq as a verified reference checker. Flagship work includes the CompCert verified C compiler, Mathematical Components proofs of the Four-Color and Feit-Thompson theorems, Homotopy Type Theory developments, and Iris for separation-logic reasoning about effectful code including Rust. Latest Prover is 9.2.0 and Platform 2025.08.3; ACM Software System Award winner, open source, taught via Software Foundations, used across academia and industry (Inria, MIT, Google, AbsInt).",
      },
      {
        title: "Diving Deep on S3 Consistency",
        href: "https://www.allthingsdistributed.com/2021/04/s3-strong-consistency.html",
        dateAdded: "2026-07-27",
        description:
          "Werner Vogels' April 2021 post explaining how Amazon S3 moved from eventual to strong read-after-write consistency by default, a good case study in retrofitting a stronger guarantee onto a live system without a performance or availability tradeoff. The mechanism is a cache coherency protocol in the S3 metadata subsystem: a new witness component tracks per-object order of operations and acts as a read barrier, so a cached value is either confirmed current or invalidated and re-fetched from the persistence tier. Useful context on what customers had to build before this, including Netflix's s3mper and Apache Hadoop's S3Guard, both of which bolted consistency on externally via DynamoDB. Written when S3 held well over 100 trillion objects and served tens of millions of requests per second.",
      },
      {
        title: "The TCP/IP Guide",
        href: "http://www.tcpipguide.com/free/t_toc.html",
        dateAdded: "2026-07-14",
        description:
          "Extremely thorough, free reference on TCP/IP networking, from the physical layer up through application protocols, a classic deep-reference for how the internet actually works. Written single-handedly by Charles M. Kozierok, originally a 2005 No Starch Press print book later posted online in full for free.",
      },
      {
        title: "Computer Networks: A Systems Approach",
        href: "https://book.systemsapproach.org/",
        dateAdded: "2026-07-14",
        description:
          "Free online edition of Peterson and Davie's well-known networking textbook, teaching networks from a systems-design perspective rather than pure protocol trivia. Now at its 6th edition (v6.2-dev) from Peterson and Davie, built with Sphinx and open to public pull-request contributions rather than a static print-only text.",
      },
      {
        title: "RFC 791: Internet Protocol",
        href: "https://datatracker.ietf.org/doc/html/rfc791#section-1.2",
        dateAdded: "2026-07-18",
        description:
          "The IETF specification for Internet Protocol version 4, including its purpose, addressing model and packet format, the primary source for IP's original design. Authored solely by Jon Postel in September 1981, fixing the 20-octet standard header and requiring every host to accept datagrams up to 576 octets.",
      },
      {
        title: "Putting the You in CPU",
        href: "https://cpu.land/",
        dateAdded: "2026-07-14",
        description:
          "Widely shared, illustrated explainer of how a program actually runs: multiprocessing, system calls, hardware interrupts, memory management and how Linux loads an executable, written for people without a CS background. Written by Lexi Mattick for Hack Club in 2023 and open-sourced on GitHub, explicitly aimed at self-taught programmers skipping a CS degree.",
      },
      {
        title: "Building Distributed Systems roadmap",
        href: "https://builddistributedsystem.com/roadmap",
        dateAdded: "2026-07-14",
        description:
          "Structured roadmap for learning distributed systems concepts in order, consensus, replication, partitioning and the rest, rather than picking topics at random. Best suited to engineers who already know the buzzwords (Raft, sharding, CAP) but want the prerequisite order pinned down before tackling a dense text like Kleppmann's DDIA.",
      },
      {
        title: "A tale of four fuzzers",
        href: "https://tigerbeetle.com/blog/2025-11-28-tale-of-four-fuzzers/",
        dateAdded: "2026-07-14",
        description:
          "TigerBeetle blog post comparing four different fuzzing approaches used to find bugs in their financial database, a look at how seriously they test for correctness. Despite the title it actually walks through five fuzzers, including one that simulates six replicas in a virtual ring to catch bugs in the route-cost function.",
      },
      {
        title: "JGroups building blocks",
        href: "http://www.jgroups.org/blocks.html",
        dateAdded: "2026-07-14",
        description:
          "Documentation for JGroups' 'building blocks', higher-level clustering and group-communication primitives built on top of its core reliable multicast library. Documents ReplicatedHashMap and DistributedLockService among the blocks, giving you distributed collections and cluster-wide locks without touching the raw JChannel API.",
      },
      {
        title: "AO hyper parallel computer",
        href: "https://ao.arweave.net/",
        dateAdded: "2026-07-14",
        description:
          "AO is a decentralized, massively parallel compute layer built on Arweave, for running processes across a permanent, permissionless network instead of centralized cloud infrastructure. Built by the Arweave/Forward Research team, it splits work across separate Scheduler, Compute, and Messenger Units so processes message each other asynchronously instead of sharing one global state.",
      },
      {
        title: "Lumen JS runtime in Rust",
        href: "https://github.com/lucid-softworks/lumen",
        dateAdded: "2026-07-14",
        description:
          "From-scratch JavaScript engine written in Rust with zero dependencies and an ARM64 JIT compiler, plus a Node-like runtime layer (event loop, filesystem, timers, web APIs) that passes the test262 conformance suite. Claims a perfect test262 score, 53,400 of 53,400 tests passing, including annexB, intl402, and staging suites.",
      },
    ],
  },
  {
    title: "Books and fundamentals",
    links: [
      {
        title: "Crafting Interpreters",
        href: "https://craftinginterpreters.com/",
        dateAdded: "2026-07-14",
        description:
          "Robert Nystrom's beloved free book on building programming language interpreters from scratch, walking through a tree-walking interpreter and then a bytecode VM, widely considered one of the best hands-on CS books written. Builds the same language twice, jlox in Java and clox in C, so you see both a tree-walker and a register-free VM.",
      },
      {
        title: "Software Design by Example",
        href: "https://third-bit.com/sdxjs/",
        dateAdded: "2026-07-14",
        description:
          "Greg Wilson's free book teaching software design by building small tools (a testing framework, a template engine, a version control system) from scratch in JavaScript, learning architecture by rebuilding it. Spans 21 chapters plus 5 appendices; Wilson co-founded Software Carpentry and won ACM SIGSOFT's 2020 Influential Educator Award.",
      },
      {
        title: "Beej's Guide to Network Programming",
        href: "https://beej.us/guide/bgnet/pdf/bgnet_a4_c_1.pdf",
        dateAdded: "2026-07-18",
        description:
          "Classic, practical C guide to socket programming for TCP/IP networks, covering clients, servers, address resolution and multiplexing. First written in 1995 and still maintained today, making it one of the longest-running free references on Berkeley sockets.",
      },
      {
        title: "Designing Data-Intensive Applications",
        href: "https://github.com/NirmalSilwal/system-design-resources/blob/master/Books/Designing%20Data%20Intensive%20Applications%20-%20Martin%20Kleppmann.pdf",
        dateAdded: "2026-07-14",
        description:
          "Martin Kleppmann's landmark book on the principles behind reliable, scalable data systems, replication, partitioning, transactions and consistency, essential reading for backend and systems engineers. Draws on Kleppmann's own engineering work at LinkedIn on Apache Samza and Kafka before he wrote this 2017 O'Reilly book.",
      },
      {
        title: "Can Programming Be Liberated (Backus)",
        href: "https://worrydream.com/refs/Backus_1978_-_Can_Programming_Be_Liberated_from_the_von_Neumann_Style.pdf",
        dateAdded: "2026-07-14",
        description:
          "John Backus's 1977 Turing Award lecture arguing that imperative, von Neumann-style programming is fundamentally limiting, and proposing functional programming as an alternative, a foundational paper in PL theory. Published in Communications of the ACM, August 1978 (vol. 21, no. 8), it introduced Backus's own FP language as a working alternative.",
      },
      {
        title: "The Joy of Elixir",
        href: "https://joyofelixir.com/",
        dateAdded: "2026-07-14",
        description:
          "Friendly, beginner-focused book teaching Elixir from scratch, aimed at people with little to no prior programming experience. Every chapter reads free directly on the site, with a paid Leanpub edition (ebook/print) for anyone who wants a bundled copy.",
      },
      {
        title: "Build your own X",
        href: "https://github.com/codecrafters-io/build-your-own-x",
        dateAdded: "2026-07-14",
        description:
          "Massive, extremely popular curated list of tutorials for building real technology from scratch, your own Git, Docker, database, shell, regex engine and dozens more, learn by rebuilding it. Started as a gist by developer Daniel Stefanovic before growing past 528k GitHub stars under CodeCrafters' stewardship.",
      },
      {
        title: "System Design Primer",
        href: "https://github.com/donnemartin/system-design-primer",
        dateAdded: "2026-07-14",
        description:
          "One of the most-starred repos on GitHub, a comprehensive, organized primer on system design fundamentals for interviews and real architecture work alike. Sits around 358k stars and is community-translated into Japanese and Chinese, with 14+ more languages in progress.",
      },
      {
        title: "Big-O visualized",
        href: "https://samwho.dev/big-o",
        dateAdded: "2026-07-14",
        description:
          "Sam Rose's interactive, animated explainer of Big-O notation, making algorithmic complexity intuitive through visualization instead of just formulas. Lets you step a bubble-sort visualizer forward and backward frame-by-frame, one entry in Sam Rose's wider series of algorithm explainers.",
      },
      {
        title: "Announcing Neki",
        href: "https://planetscale.com/blog/announcing-neki",
        dateAdded: "2026-07-15",
        description:
          "PlanetScale's from-scratch sharded Postgres system, built by the Vitess team but not a Vitess fork, addressing Postgres's different planner and replication model instead of reusing MySQL-oriented sharding logic. Credited to a nine-person team including Vitess co-creators Andres Taylor and Shlomi Noach, gated behind a request-access form at neki.dev rather than a public repo.",
      },
      {
        title: "What is Vitess",
        href: "https://planetscale.com/blog/what-is-vitess",
        dateAdded: "2026-07-15",
        description:
          "Explains the VTGate/VTTablet architecture: a stateless proxy layer routing queries to sharded MySQL tablets and presenting a single logical database to the application, originally built at YouTube in 2011. Notes Vitess is now co-maintained across GitHub, Slack, Square, and Stripe, not just its YouTube/PlanetScale origins, showing broad multi-company investment.",
      },
    ],
  },
  {
    title: "Courses and learning paths",
    links: [
      {
        title: "Fanout",
        href: "https://fanout.sh/",
        dateAdded: "2026-08-18",
        kind: "course",
        useFor: [
          "ai research roadmap",
          "system design course",
          "ml math",
          "inference engineering roadmap",
          "read research papers",
          "math notation reference",
        ],
        description:
          "Mapped learning hub across AI research, system design and machine learning mathematics, laid out as roadmaps rather than one linear course. Sections include an AI Research course and roadmap, a system design course of concepts, cases and builds, an ML mathematics course, an LLM Inference Engineering Roadmap for 2026, a Math Decoder for getting through research papers, a Mathematical Notation Library, interactive labs, Open Robotics, daily paper explainers and a Knowledge Topography view over the whole thing. There is a pricing page, so parts of it are paid, and no author or team is named on the site.",
      },
      {
        title: "Daily UI",
        href: "https://www.dailyui.co/",
        dateAdded: "2026-08-05",
        kind: "course",
        useFor: [
          "ui design challenge",
          "daily design challenge",
          "daily design practice",
          "ui exercises",
          "ui design prompts",
          "learn ui design",
          "100 day design challenge",
        ],
        description:
          "Free email challenge that sends one interface design prompt at a time for 100 days, aimed at building a habit and a portfolio at once rather than teaching through lessons. Prompts are single screens or components, starting with a sign up page on day one and a credit card checkout on day two, and you interpret each one yourself then post the result with the dailyui tag. The site says the challenge has run since 2016 and that more than 500,000 people across over 190 countries have shared upwards of 20 million designs; it also hands out surprise rewards such as design resources and product discounts. Credited on the site to Remote Jobs, though the challenge has changed hands over the years and attribution elsewhere is inconsistent.",
      },
      {
        title: "Zerodha Varsity",
        href: "https://zerodha.com/varsity/modules/",
        dateAdded: "2026-08-05",
        kind: "course",
        stack: ["finance", "trading"],
        useFor: [
          "stock market basics",
          "learn trading",
          "technical analysis",
          "options trading",
          "investing course",
          "personal finance",
          "financial modelling",
        ],
        description:
          "Stock market education from Zerodha, the Indian brokerage, structured as 17 modules you work through in order rather than a blog to skim. It starts at Introduction to Stock Markets (15 chapters) and Technical Analysis (22), goes deep on derivatives through Options Theory for Professional Trading (25) and Option Strategies (14), then covers Markets and Taxation, Risk Management and Trading Psychology, Trading Systems, Sector Analysis, Integrated Financial Modelling and personal finance tracks for mutual funds (33 chapters), insurance and the National Pension System. The outlier is Innerworth at 603 chapters, a run of trading psychology newsletters published between 2002 and 2007 by Marketwise, a US broking firm. Modules 1 to 11 have Hindi versions, the first five carry video series, there is a Varsity app on both mobile stores, and the footer notes that reproducing the text and images is not permitted.",
      },
      {
        title: "Tech Interview Handbook",
        href: "https://www.techinterviewhandbook.org/software-engineering-interview-guide/",
        dateAdded: "2026-07-14",
        description:
          "Free, comprehensive guide to software engineering interviews: coding rounds, system design, behavioral questions and negotiation, widely used by candidates prepping for big-tech interviews. Written by Yangshun Tay, who also created the Blind 75 list and later GreatFrontEnd, giving it unusually credible LeetCode-strategy roots.",
      },
      {
        title: "Frontend Masters courses",
        href: "https://frontendmasters.com/courses/",
        dateAdded: "2026-07-14",
        description:
          "Frontend Masters' full course catalog, in-depth video courses on JavaScript, frameworks, CSS and web performance taught by well-known practitioners. Instructor roster includes working engineers like Lydia Hallie (Anthropic) and Brian Holt (Microsoft), so courses reflect current industry practice, not just theory.",
      },
      {
        title: "Frontend.fyi courses",
        href: "https://www.frontend.fyi/courses",
        dateAdded: "2026-07-14",
        description:
          "Course catalog from Frontend.fyi, practical frontend engineering courses and tutorials. Run solo by Jeroen Reumkens as a one-time-purchase, lifetime-access catalog, currently anchored by a 44+ lesson Motion for React course.",
      },
      {
        title: "Effective Software courses",
        href: "https://www.effective.software/courses",
        dateAdded: "2026-07-14",
        description:
          "Course catalog from Effective Software, focused on writing better, more maintainable software. Taught by Hemanta Kumar Sundaray across 7 courses and roughly 87 chapters, with heavy focus on the Effect TypeScript library ecosystem.",
      },
      {
        title: "Database School Convex course",
        href: "https://databaseschool.com/series/convex/videos/359",
        dateAdded: "2026-07-14",
        description:
          "Database School's video course specifically on Convex, the reactive backend platform, walking through its data model and real-time sync. Created by Aaron Francis, it builds one production app end to end, covering auth, workflows, search, AI features, and deployment.",
      },
      {
        title: "HTML and CSS for absolute beginners",
        href: "https://www.youtube.com/playlist?list=PL4-IK0AVhVjOJs_UjdQeyEZ_cmEV3uJvx",
        dateAdded: "2026-07-14",
        description:
          "YouTube playlist teaching HTML and CSS from zero, aimed at people who have never written a line of code before. Made by Kevin Powell, a working front-end developer whose channel favors practical, real-world CSS problem solving over dry syntax reference.",
      },
      {
        title:
          "Digital Design and Computer Architecture (Spring 2026 livestream)",
        href: "https://www.youtube.com/playlist?list=PL5Q2soXY2Zi-yo9kK-BKrq11ykNKkVEpd",
        dateAdded: "2026-07-14",
        description:
          "Recorded livestream playlist of a Digital Design and Computer Architecture course, covering hardware fundamentals from logic gates up to processor design. Taught by Onur Mutlu (ETH Zurich course 227-0003-10L, safari.ethz.ch/ddca), whose SAFARI group has livestreamed full free lecture archives since 2020.",
      },
      {
        title: "Learn X in Y Minutes",
        href: "https://learnxinyminutes.com",
        dateAdded: "2026-07-14",
        description:
          "Learn a programming language's core syntax in minutes via heavily commented, runnable example code instead of a full tutorial. Created by Adam Bard, entirely open source on GitHub under CC BY-SA 3.0 and grown by community pull requests, not a single author.",
      },
      {
        title: "Flukeout: CSS Diner",
        href: "https://flukeout.github.io",
        dateAdded: "2026-07-14",
        description:
          "Game for learning CSS selectors: each level gives you a target element to select and you write the selector that hits it. Built by GitHub user @flukeout as a fully open-source project (github.com/flukeout/css-diner), so you can fork it or submit new levels yourself.",
      },
      {
        title: "Frontend Practice",
        href: "https://www.frontendpractice.com",
        dateAdded: "2026-07-14",
        description:
          "Practice site for building real UI from real designs, closing the gap between tutorials and actually implementing a design handoff. Each challenge ships downloadable design assets (images, fonts, specs) so you can hit pixel-perfect measurements instead of eyeballing a screenshot.",
      },
      {
        title: "ui.dev",
        href: "https://ui.dev",
        dateAdded: "2026-07-14",
        description:
          "Frontend courses and tutorials, especially React, from the team behind the React Router and TanStack Query educational content. Founded by Tyler McGinnis; the domain now redirects to Fireship.dev, having merged into Jeff Delaney's Fireship course platform.",
      },
      {
        title: "JavaScript30",
        href: "https://javascript30.com",
        dateAdded: "2026-07-15",
        description:
          "Wes Bos's free 30-day vanilla JavaScript coding challenge: 30 build-along tutorials with no frameworks or libraries. Its own signup page counter shows 751,688 people have taken the course, out of 300,000+ who've taken a Wes Bos course.",
      },
      {
        title: "CSS Grid",
        href: "https://cssgrid.io",
        dateAdded: "2026-07-15",
        description:
          "Wes Bos's free 25-video course covering CSS Grid fundamentals through real-world layout examples. All 25 videos (about 4 hours total) unlock instantly with starter files and solutions, and the course is sponsored by Firefox DevTools.",
      },
      {
        title: "Beginner JavaScript",
        href: "https://beginnerjavascript.com",
        dateAdded: "2026-07-15",
        description:
          "Wes Bos's paid, exercise-heavy course teaching modern JavaScript from scratch. 88+ videos across 15 modules totaling 28 hours, split into a cheaper 6-module Starter tier and the full Master Package.",
      },
      {
        title: "Command Line Power User",
        href: "https://commandlinepoweruser.com",
        dateAdded: "2026-07-15",
        description:
          "Wes Bos's free course on a modern command-line workflow: ZSH, aliases and related terminal tooling. Just 11 short videos, walking from iTerm/Oh-My-Zsh setup to the `z` jump tool and `trash` for safer file deletion.",
      },
      {
        title: "Level Up Tutorials",
        href: "https://levelup.video",
        dateAdded: "2026-07-15",
        description:
          "Scott Tolinski's tutorial platform (founded 2012, merged into Syntax.fm in 2023), thousands of free and premium web dev video tutorials. Scott Tolinski also co-hosts the Syntax.fm podcast with Wes Bos, so the two men's course catalogs share one overlapping audience.",
      },
    ],
  },
  {
    title: "Coding challenges and practice",
    links: [
      {
        title: "Build your own load tester",
        href: "https://codingchallenges.fyi/challenges/challenge-load-tester",
        dateAdded: "2026-07-14",
        description:
          "Coding Challenges project spec for building your own HTTP load-testing tool from scratch, understanding load testing by implementing one instead of just using wrk or k6. Written by John Crickett, it's a 6-step build-up from a single bare request to concurrent `-c` load with min/max/mean latency stats.",
      },
      {
        title: "One Billion Row Challenge",
        href: "https://1brc.dev/",
        dateAdded: "2026-07-14",
        description:
          "The viral 1BRC challenge: parse and aggregate a billion rows of temperature data as fast as possible, a popular benchmark for language and I/O performance tuning across many languages. Created by Gunnar Morling in January 2024 as a Java-only challenge; the fastest submitted solutions crunched all 1B rows in under 2 seconds.",
      },
      {
        title: "One Trillion Row Challenge",
        href: "https://docs.coiled.io/blog/1trc.html",
        dateAdded: "2026-07-14",
        description:
          "Coiled's writeup tackling a trillion-row version of the 1BRC challenge, pushing the same problem into genuinely distributed-computing territory. Ran on 100 m6i.xlarge instances for $3.26, or $1.10 with spot ARM nodes, over 2.5 TiB across 100,000 Parquet files.",
      },
    ],
  },
  {
    title: "Developer tools and utilities",
    links: [
      {
        title: "Tooey",
        href: "https://tooey.design",
        dateAdded: "2026-08-29",
        kind: "tool",
        style: "terminal",
        useFor: [
          "tui design tool",
          "design in the terminal",
          "terminal ui editor",
          "glyph borders",
          "tui flex layout",
          "multiplayer tui",
        ],
        description:
          "Browser design tool for terminal UIs by Aarav Sareen, who does design engineering at OpenCode. You lay out on the terminal grid with glyph-based borders that join, flex layouts and multiplayer. A components library is marked soon. Open the app at /files. Not the argparse TUI of the same name. Announced August 2026.",
      },
      {
        title: "Satori",
        href: "https://github.com/vercel/satori",
        dateAdded: "2026-08-21",
        kind: "library",
        stack: ["jsx", "svg", "wasm", "yoga", "harfbuzz", "cloudflare-workers"],
        useFor: [
          "og image",
          "open graph image",
          "html to svg",
          "generate images from jsx",
          "social card generator",
          "render text to image",
          "image generation on the edge",
        ],
        description:
          "Library that converts HTML and CSS into SVG, the engine behind Vercel's Open Graph image generation and the Next.js social card examples. Layout runs on Yoga, the same flexbox engine React Native uses, and text shaping on HarfBuzz, so ligatures, small caps, stylistic sets and complex scripts like Arabic all work; fonts are passed in as TTF, OTF or WOFF buffers, and WOFF2 is not supported. The JSX has to be pure and stateless (no hooks, no dangerouslySetInnerHTML), and it implements a subset rather than a browser: no 3D transforms, no z-index, no calc, and no full bidirectional layout yet. Written by Shu Ding under the Vercel org, MPL-2.0, 13.8k stars, running in the browser, Node 16+ and Web Workers, with a satori/standalone build for runtimes that block dynamic WASM such as Cloudflare Workers and an experimental satori/jsx runtime that drops the React dependency. Test and share cases at og-playground.vercel.app.",
      },
      {
        title: "Re:notch",
        href: "https://github.com/yosaiy/renotch",
        dateAdded: "2026-08-19",
        kind: "tool",
        stack: ["swift", "swiftui", "macos"],
        useFor: [
          "mac notch app",
          "dev dashboard",
          "watch local ports",
          "menu bar alternative",
          "docker status",
          "clipboard history",
        ],
        description:
          "macOS app by yosaiy that turns the notch into a developer command center instead of dead pixels. Dev Activity watches local servers, ports, Git status, Docker containers and build jobs; Media Control drives Apple Music and Spotify with album art; Productivity adds a focus timer, clipboard history and a file drop shelf; a Browser Bridge handles YouTube playback and Chromium download monitoring through an optional unpacked extension. Swift and SwiftUI, entirely local with no accounts, telemetry or cloud sync. macOS 13 or later, MIT, 41 stars, shipped either as a prebuilt Re:notch.app or built from source with swift run Renotch.",
      },
      {
        title: "deepsec",
        href: "https://deepsec.sh/",
        dateAdded: "2026-08-18",
        kind: "tool",
        stack: ["llm"],
        useFor: [
          "security code review",
          "scan whole codebase",
          "find vulnerabilities",
          "ai security audit",
          "legacy code review",
        ],
        description:
          "Vercel's open-source harness for running an AI security review across a whole existing codebase instead of only the diff in a pull request, on the argument that most legacy code was never reviewed and anything from six months ago was reviewed by an older model. Work is fanned out across scaled VMs, runs in your own infrastructure with agent sandboxing, and starts with npx deepsec init. Source is at vercel-labs/deepsec. The site names no license, model providers or detection benchmarks, so read the docs before budgeting a full run.",
      },
      {
        title: "next-dev-bridge",
        href: "https://next-dev-bridge.labs.vercel.dev/",
        dateAdded: "2026-08-07",
        stack: ["next", "node", "hmr", "dev-server", "agents"],
        useFor: [
          "next.js dev server",
          "dev server events",
          "build errors",
          "watch build errors",
          "runtime errors",
          "hmr events",
          "dev overlay",
          "agent watch dev server",
          "compiler errors",
        ],
        description:
          "Connects to a running Next.js dev server and normalizes its noisy HMR traffic into a small set of readable events, so a CLI, preview shell, or agent can follow build state without opening a browser. The event set is just build:ready, build:error, build:recovered and runtime:error, the last carrying source-mapped frames when available. Ships a `connect-next http://localhost:3000` CLI that prints lines like `>>> [ERROR] count=1 change=shown`, plus a `connect()` function taking a url and an (event, state) callback with .stop() to tear down. From vercel-labs: ESM, Node 18 or newer, and it targets the HMR endpoints of Next.js 16.2 and 16.3, so expect it to track recent releases rather than hold across versions.",
      },
      {
        title: "Web Dev Resources",
        href: "https://web-dev-resources.com/#resources",
        dateAdded: "2026-08-06",
        kind: "directory",
        useFor: [
          "free dev tools",
          "web development resources",
          "curated developer tools",
          "free web dev ebooks",
          "css button generator",
          "beginner web dev resources",
          "small browser utilities",
        ],
        description:
          "One-person directory of small free web development tools, articles and ebooks, curated by Marko Denic. It lists 19 tools (CSS button generator, glassmorphism generator, QR code generator, Open Graph and Twitter card generators, code minifier and beautifier, password generator, tech acronym lookup, SSL certificate monitor), 11 articles and newsletter issues dated through June 2026, and 3 free ebooks including 'HTML Tips: The Hidden Gems' and 'Modern HTML & CSS'. Every listed item is free; the only paid link is a $49 one-time community. There is no submission form, so treat it as one developer's picks rather than a crowdsourced index.",
      },
      {
        title: "Boron",
        href: "https://boron.sh/",
        dateAdded: "2026-08-05",
        kind: "tool",
        useFor: [
          "terminal screenshot",
          "editable terminal screenshot",
          "code screenshot",
          "share terminal output",
          "save terminal as png",
          "terminal image generator",
          "style terminal capture",
        ],
        description:
          "Browser tool for turning pasted terminal output into an editable, presentation-ready image, useful for documentation, launch posts and bug reports. Built by Colin McDonnell, it includes seven syntax themes and nine backdrops, plus controls for the title bar, corner radius, shadow, padding, minimum width, text and fill colors, and ANSI-style text formatting. The result can be copied as an image or saved as PNG directly from the page.",
      },
      {
        title: "anydoc",
        href: "https://github.com/firecrawl/anydoc",
        dateAdded: "2026-08-05",
        kind: "library",
        stack: ["rust", "node", "python", "wasm"],
        useFor: [
          "docx to markdown",
          "pdf to markdown",
          "convert documents",
          "office files to markdown",
          "document parsing",
          "llm ready markdown",
          "epub to markdown",
        ],
        description:
          "Rust library that converts Word, PowerPoint, Excel, OpenDocument, RTF, EPUB, CSV and PDF into GitHub-flavored Markdown, with one consistent output shape regardless of which format went in. Built by Firecrawl to get office documents into an LLM-readable form in single-digit milliseconds, and it backs their hosted Parse product, so the managed route adds OCR for scanned pages that the library cannot read alone. Ships bindings for Node, Python and the browser through WebAssembly, plus a CLI you can run straight through npx, and an agent skill installable with `npx skills add firecrawl/anydoc` so a coding agent can read any document it encounters. MIT licensed, published to crates.io, npm and PyPI, and the demo page runs the WebAssembly build locally so files never leave the machine. Very new: opened 3 August 2026 and already past 3,400 stars.",
      },
      {
        title: "terminal-browser",
        href: "https://terminal-browser.com/",
        dateAdded: "2026-08-05",
        stack: ["rust", "chromium", "terminal"],
        useFor: [
          "browser in terminal",
          "terminal browser",
          "preview localhost in terminal",
          "agent controlled browser",
          "kitty graphics protocol",
          "ghostty",
          "browse over ssh",
        ],
        description:
          "Real Chromium browser rendered inside a terminal tab, for keeping a coding agent and the site it is editing side by side without leaving the terminal. It reads pixels from Chromium's Electron offscreen rendering API straight off the GPU and paints them through the kitty graphics protocol, with a Rust engine compositing browser chrome and page content onto one canvas, so it needs a kitty-graphics-capable terminal such as Ghostty, kitty, cmux or WezTerm. The agent angle is the point: terminal-browser action is an agent-browser compatible CLI, so an agent can drive any open browser, while --split right parks a live localhost view or a generated HTML plan beside the conversation, and it works over SSH so a remote dev server needs no port forwarding. Built by zenbu-labs, MIT with 806 stars, installed by curl script; macOS is the working platform today, helped by a background Swift app reading trackpad and scroll input the terminal cannot supply, while the site lists Linux but the repo still has it as an open roadmap item.",
      },
      {
        title: "Vite+",
        href: "https://viteplus.dev/",
        dateAdded: "2026-08-05",
        stack: ["vite", "rolldown", "oxc", "vitest"],
        useFor: [
          "vite plus",
          "unified toolchain",
          "replace eslint",
          "monorepo task runner",
          "oxlint",
          "rolldown",
          "one cli for lint test build",
        ],
        description:
          "Single CLI (vp) that folds runtime, package manager, dev server, linter, formatter, test runner, task runner and bundler into one tool, so a project stops assembling six separate configs to cover those jobs. Built by VoidZero, the company behind Vite, Vitest, Rolldown and Oxc, currently in beta and MIT licensed at voidzero-dev/vite-plus. Commands span env, install, dev, check, build, run, test and pack: dev and build ride Vite and Rolldown with an opt-in full-bundle dev mode, check runs Oxlint and Oxfmt plus tsgo for type-aware linting with 750+ ESLint-compatible rules and Prettier-compatible formatting, test is Vitest including Browser Mode and visual regression, run is a caching monorepo task runner, and pack uses tsdown for DTS bundling, automatic package exports and standalone binaries. Claimed numbers are up to 40x faster builds than webpack, 50x to 100x faster linting than ESLint and up to 30x faster formatting than Prettier; install is a curl script from vite.plus rather than an npm package.",
      },
      {
        title: "shieldcn",
        href: "https://shieldcn.dev",
        dateAdded: "2026-07-29",
        description:
          "Badge and chart generator for README files, taking the idea of shields.io and badgen.net and restyling it with shadcn/ui design tokens. Created by Justin Levine as an open-source project. Beyond badges it renders star history, commit history, issue counts, npm download figures and custom JSON as portable SVGs, so the charts work on GitHub where JavaScript does not. It also ships a README Studio for building the whole file visually, header images, and an agent skill for wiring it into a coding agent.",
      },
      {
        title: "scriptc",
        href: "https://github.com/vercel-labs/scriptc",
        dateAdded: "2026-07-27",
        description:
          "Compiler from Vercel Labs that turns ordinary TypeScript into a small native executable with no Node, V8 or JS engine inside the binary, for shipping a CLI as one self-contained file instead of a script plus a runtime. scriptc run executes a file directly, scriptc build produces the binary, and scriptc coverage reports how much of a codebase can compile statically. Static compilation is the default, --dynamic embeds quickjs-ng (roughly 620KB) for code that needs real dynamism, and whatever neither tier can handle is rejected at build time with a diagnostic rather than failing later. Covers classes, closures, generics, async/await, the standard library, and much of Node's API surface (fs, path, process, net, http, https, tls, fetch) plus npm dependencies where it can, with comptime(() => ...) for build-time evaluation, validated casts on JSON.parse, and C ABI bindings behind --ffi. Apache-2.0, installed with npm install -g scriptc and requires clang; 813 stars at time of adding.",
      },
      {
        title: "shadscan",
        href: "https://www.shadscan.com/",
        dateAdded: "2026-07-27",
        description:
          "CLI that statically audits a shadcn app for UI fundamentals, flagging accessibility regressions, state handling mistakes and composition problems without running the code. Run it as pnpm dlx @shadscan/cli in a terminal or wire it into CI; the audits are deterministic, so the same source always yields the same report. Understands Next.js, Vite, TanStack Start, Astro, React Router and Laravel project layouts. Open source at TheOrcDev/shadscan by OrcDev, v0.5.0 with 235 stars at time of adding.",
      },
      {
        title: "Native SDK",
        href: "https://github.com/vercel-labs/native",
        dateAdded: "2026-07-26",
        description:
          "Toolkit from Vercel Labs for building native desktop apps out of declarative markup, with Zig compiling and rendering straight to OS windows so the shipped binary carries no browser, WebView or JS runtime. An app is three files: a .native markup view, logic in TypeScript or Zig, and a manifest; state moves through explicit messages, so an on-press attribute dispatches to an update function rather than mutating in place. macOS support is deepest, Linux runs on a software renderer, Windows uses Win32, and iOS and Android are experimental. Apache-2.0 and roughly 6.9k stars, installed with npm i -g @native-sdk/cli, with Calculator, Notes, Soundboard, Deck and Feed examples covering persistence, virtual lists and custom theming, plus an automation server for agent-driven development.",
      },
      {
        title: "Turbotunnel",
        href: "https://turbotunnel.dev/",
        dateAdded: "2026-07-23",
        description:
          "CLI that exposes local apps to the web through a gateway you deploy to your own Vercel account, built on Fluid Compute with a pool of relay WebSockets and Vercel Queue as request fallback. Install with npm i -g turbotunnel, then tt deploy sets up the gateway, tt dev runs your dev server with a tunnel attached, tt http exposes an already-running port, and tt status and tt list monitor active tunnels. Built by GitHub user eersnington; no pricing or license stated on the page.",
      },
      {
        title: "Is Ready For Launch",
        href: "https://isreadyforlaunch.com/",
        dateAdded: "2026-07-23",
        description:
          "Free pre-launch audit tool: paste a URL and it checks technical, SEO and accessibility site health, reporting passed checks, warnings and errors plus an SSL certificate check. Built by Csaba Kissi. Its distinctive feature is an LLM fix-prompt generator that turns detected first-party code issues into a prompt you can hand to a coding agent, and finished audits are shareable to X, Reddit and Facebook.",
      },
      {
        title: "GitHub Wrapped",
        href: "https://www.trygitwrap.com/",
        dateAdded: "2026-07-22",
        description:
          "Year-in-review generator for a GitHub account, a Spotify Wrapped equivalent for developers rendered as a retro terminal (GITHUB_WRAPPED.EXE) that you feed a username. The 2025 edition counts private contributions and adds a regional leaderboard, reporting aggregate stats of 130+ countries, 12,000+ developers and 1M+ commits tracked. Built by Klaus Codes and Ryan.",
      },
      {
        title: "joyful",
        href: "https://www.npmjs.com/package/joyful",
        dateAdded: "2026-07-19",
        description:
          "Kaylee Williams' zero-dependency npm package that generates friendly, safe-for-work word combinations like amber-fox for project names, usernames, labels, demo data, and unique-looking identifiers. Supports segment counts, custom separators, category patterns (adjective, color, animal, city, nature, space), maxLength filtering, custom word lists, omit lists, and a CLI.",
      },
      {
        title: "Firecrawl",
        href: "https://www.firecrawl.dev/",
        dateAdded: "2026-07-14",
        description:
          "Popular API for turning any website into clean, LLM-ready markdown or structured data, crawling and scraping handled for you instead of hand-rolling a scraper. Backs Y Combinator-funded infra behind agent products like Perplexity and OpenAI's own crawling pipelines, per its customer list.",
      },
      {
        title: "asccli",
        href: "https://asccli.sh/",
        dateAdded: "2026-07-14",
        description:
          "CLI tool, name suggests an App Store Connect command-line interface for automating app release tasks. Built by indie developer Rudrank Jain as a single dependency-free Go binary covering 76 command groups over 1,200+ App Store Connect API endpoints.",
      },
      {
        title: "Better-T Stack",
        href: "https://better-t-stack.dev/new?fe-w=next&rt=node&pm=pnpm&ex=todo",
        dateAdded: "2026-07-14",
        description:
          "Interactive scaffolding tool for a type-safe full-stack TypeScript project (frontend, backend, package manager, example app all configurable), this link opens a preconfigured Next.js/Node/pnpm/todo-app starter. Created by Aman Varshney (npm package create-better-t-stack), so it's a solo-maintained CLI rather than a big-vendor scaffold.",
      },
      {
        title: "Comark",
        href: "https://comark.dev/",
        dateAdded: "2026-07-14",
        description:
          "Markdown engine for the modern web: write markdown with embedded components and render it across React, Vue, Svelte or Angular from one unified parser, with plugins and streaming support built in. Best picked for monorepos shipping the same docs/blog content into multiple framework apps, since it skips maintaining a separate parser per framework.",
      },
      {
        title: "DevTool Lab",
        href: "https://devtoollab.com/tools",
        dateAdded: "2026-07-14",
        description:
          "Free browser-based developer utility site with 500+ tools: converters, formatters, PDF splitters, webhook testing and more, all running client-side for privacy. Also bundles an AI token counter tuned for GPT-5 and Claude, plus a pastebin with syntax highlighting across 30+ languages.",
      },
      {
        title: "Digger",
        href: "https://digger.tools/",
        dateAdded: "2026-07-14",
        description:
          "Open-source CI/CD orchestrator for Terraform and OpenTofu, running plan/apply directly in your existing CI pipeline instead of a separate hosted service. MIT-licensed with close to 5,000 GitHub stars and 600 forks, maintained by the diggerhq organization on GitHub.",
      },
      {
        title: "Dev Resources API building",
        href: "https://devresourc.es/category/api-building",
        dateAdded: "2026-07-14",
        description:
          "Curated list of the top tools for API development, design and testing clients like Postman and Insomnia alongside backend frameworks like Appwrite and Encore. Lists 21 resources total, spanning niche picks like the Voiden API client and Odown's API monitoring alongside the usual suspects.",
      },
      {
        title: "DrawDB",
        href: "https://www.drawdb.app/editor",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source, browser-based entity-relationship diagram editor for designing database schemas visually and exporting to SQL. Open source on GitHub via drawdb-io with over 38,000 stars, and exports schemas beyond MySQL to SQL Server, MariaDB, and Oracle.",
      },
      {
        title: "Emulate",
        href: "https://emulate.dev/",
        dateAdded: "2026-07-14",
        description:
          "Local API emulation tool providing stateful, production-fidelity stand-ins for Stripe, GitHub, Google, AWS and other services, so integrations can be tested offline without real API keys. Built by Vercel, it emulates 11 services total, including Slack, Apple, Microsoft, Okta, MongoDB Atlas, and Resend, via npx emulate.",
      },
      {
        title: "Electrobun",
        href: "https://blackboard.sh/blog/electrobun-v1",
        dateAdded: "2026-07-14",
        description:
          "Lightweight alternative to Electron for building native desktop apps, using the OS's built-in webview instead of bundling a full Chromium runtime, for much smaller app sizes. Built solo by Yoav over two years as successor to co(lab); ships differential updates via zig-bsdiff, a C-to-Zig port tuned with SIMD and zstd.",
      },
      {
        title: "Native SDK",
        href: "https://native-sdk.dev/introduction",
        dateAdded: "2026-07-18",
        description:
          "Framework for native desktop apps with TypeScript cores, customizable native UI, platform APIs, embedded web content and an automation-ready workflow. Made by Vercel with about 6.6k GitHub stars; stable on macOS, Linux and Windows today, with iOS and Android support still experimental.",
      },
      {
        title: "Graphite changelog",
        href: "https://graphite.dev/blog?category=changelog",
        dateAdded: "2026-07-14",
        description:
          "Changelog feed for Graphite, the stacked-PR code review tool, tracking new features as they ship. Graphite's founders came from Meta, bringing the internal stacked-diff review workflow Meta uses at scale to outside teams as a product.",
      },
      {
        title: "IT Tools",
        href: "https://it-tools.tech/",
        dateAdded: "2026-07-14",
        description:
          "Well-known, large collection of free online developer utilities (encoders, converters, generators, formatters) in one consistent, ad-free interface. Fully open source (MIT) and self-hostable from a single Docker image; every tool runs client-side in the browser, so your input never hits a server.",
      },
      {
        title: "Namae",
        href: "https://namae.dev/s/Blankershot",
        dateAdded: "2026-07-14",
        description:
          "Name-availability checker for developers, checking whether a project or product name is free across domains, npm, GitHub and social handles at once. Each search gets its own shareable permalink (namae.dev/s/<name>), so you can send a candidate name's availability check straight to teammates.",
      },
      {
        title: "nuqs",
        href: "https://www.npmjs.com/package/nuqs",
        dateAdded: "2026-07-14",
        description:
          "Type-safe search params state manager for React and Next.js: store UI state in the URL query string with a useState-like API instead of hand-parsing search params. Built by François Best (franky47); ships adapters for Next.js App Router, React Router, and Remix so the same hooks work across routers.",
      },
      {
        title: "Timezones Digital",
        href: "https://www.timezones.digital/",
        dateAdded: "2026-07-14",
        description:
          "Time zone conversion tool for figuring out what time it is elsewhere and coordinating schedules across regions. No sign-up, install, or account: just pick two or more cities and drag a single timeline to see overlapping work hours instantly.",
      },
      {
        title: "TypeDoc",
        href: "https://github.com/TypeStrong/typedoc",
        dateAdded: "2026-07-14",
        description:
          "Documentation generator that builds a full API reference site directly from TypeScript source and its type annotations, no separate doc-comment format to maintain. Apache-2.0 licensed with over 8,400 GitHub stars and 250+ releases across thousands of commits, reflecting years of steady maintenance.",
      },
      {
        title: "wterm",
        href: "https://wterm.dev/",
        dateAdded: "2026-07-14",
        description:
          "Web-based terminal emulator that renders to the real DOM, so native text selection, copy/paste, find-in-page and accessibility work for free; built on a Zig/WASM core for performance. Its rendering engine compiles to a roughly 12KB WASM binary and redraws only dirty rows via requestAnimationFrame, staying fast despite living in the DOM.",
      },
      {
        title: "WTF terminal dashboard",
        href: "https://wtfutil.com/",
        dateAdded: "2026-07-14",
        description:
          "Personal terminal dashboard for developers: configurable widgets (git status, todos, weather, calendars) all visible in one terminal window. Created by Chris Cummer in Go, with 70+ widget modules spanning Jira, PagerDuty, cryptocurrency prices, and NASA's picture of the day.",
      },
      {
        title: "xmcp",
        href: "https://xmcp.dev/docs",
        dateAdded: "2026-07-14",
        description:
          "Framework that simplifies building MCP servers, auto-registering tools, prompts and resources with no extra config, usable standalone or dropped into an existing Next.js or Express app. Ships a `create-xmcp-app` CLI that scaffolds a new server in one command, mirroring create-next-app's zero-config bootstrap flow.",
      },
      {
        title: "yt-dlp",
        href: "https://github.com/yt-dlp/yt-dlp",
        dateAdded: "2026-07-14",
        description:
          "The de facto standard command-line tool for downloading video and audio from YouTube and thousands of other sites, the actively maintained fork of youtube-dl. Covers over 1,800 supported sites and adds SponsorBlock integration to auto-skip sponsored segments, features youtube-dl never had.",
      },
      {
        title: "Mafs",
        href: "https://mafs.dev/",
        dateAdded: "2026-07-14",
        description:
          "React library for building interactive math visualizations: coordinate planes, functions and geometry that respond to user input, used for educational and explainer content. Built by Steven Petryk, a former Khan Academy engineer who applied its interactive-exercise rendering approach to a standalone React library.",
      },
      {
        title: "Affine",
        href: "https://affine.pro/",
        dateAdded: "2026-07-14",
        description:
          "Open-source, local-first workspace combining docs, whiteboards and databases, positioned as a privacy-respecting alternative to Notion. Runs on its own open-source BlockSuite editor framework with a CRDT sync engine, giving real-time multiplayer editing without a central server.",
      },
      {
        title: "useSend",
        href: "https://usesend.com/",
        dateAdded: "2026-07-14",
        description:
          "Open-source transactional and marketing email platform, a self-hostable alternative to Resend or SendGrid. Runs on Amazon SES under the hood, charging as little as $0.0004 per transactional email, and has 4.4K GitHub stars.",
      },
      {
        title: "Documenso docs",
        href: "https://docs.documenso.com/",
        dateAdded: "2026-07-14",
        description:
          "Documentation for Documenso, the open-source DocuSign alternative, covering setup, self-hosting and API usage. Dual-licensed under AGPLv3 plus a paid Enterprise tier, so you can self-host free or buy hosted support and extra features.",
      },
      {
        title: "listmonk",
        href: "https://listmonk.app/",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted, high-performance newsletter and mailing list manager, a free alternative to Mailchimp with no subscriber-count pricing. Built in Go with a Vue frontend by solo maintainer Kailash Nadh; one production setup sent 7M+ emails on just 57MB RAM.",
      },
      {
        title: "AffiliateOtter",
        href: "https://www.affiliateotter.com/",
        dateAdded: "2026-07-14",
        description:
          "Directory of SaaS and software affiliate programs, aggregating commission rates and program details across thousands of products for people building affiliate income. Breaks listings down by network size, e.g. Impact alone accounts for 329 apps, so you can shop by which platform actually pays.",
      },
      {
        title: "OSINT4ALL",
        href: "https://start.me/p/L1rEYQ/osint4all",
        dateAdded: "2026-07-14",
        description:
          "Large curated start.me page of open-source intelligence (OSINT) tools and resources, organized by category for investigation and research work. Uses start.me's widget-board format instead of a static list, keeping hundreds of tools sorted into collapsible, continuously updated category panels.",
      },
      {
        title: "Vercel Community",
        href: "https://community.vercel.com/",
        dateAdded: "2026-07-14",
        description:
          "Official Vercel community forum for questions, discussion and troubleshooting around Vercel and Next.js deployments. Runs on open-source Discourse and adds a dedicated v0 category plus a weekly leaderboard gamifying helpful community answers.",
      },
      {
        title: "Hucre spreadsheet",
        href: "https://github.com/productdevbook/hucre",
        dateAdded: "2026-07-14",
        description:
          "Zero-dependency TypeScript spreadsheet engine reading and writing XLSX, CSV, ODS, JSON, NDJSON and XML with schema validation, streaming and round-trip preservation, works in any JS runtime including the browser and Cloudflare Workers. MIT-licensed and gaining fast traction, already past 1,400 GitHub stars just months after its initial release.",
      },
      {
        title: "Unlighthouse",
        href: "https://unlighthouse.dev/",
        dateAdded: "2026-07-14",
        description:
          "Runs Google Lighthouse across an entire site automatically (not just one page), crawling every route and generating a site-wide performance/SEO/accessibility report. Built by Harlan Wilton (Nuxt core team), pulling roughly 4,000 downloads a day and 4,700 GitHub stars under MIT.",
      },
      {
        title: "OSS Perks",
        href: "https://www.ossperks.com/",
        dateAdded: "2026-07-14",
        description:
          "Curated directory consolidating free credits, tools and infrastructure sponsorships available to open-source maintainers, 53 programs and 158 perks in one place. Built solo by developer Aniket Pawar; entries like Vercel's OSS program list exact grants such as $3,600 in platform credits.",
      },
      {
        title: "Vercel Doctor",
        href: "https://www.vercel-doctor.com/",
        dateAdded: "2026-07-14",
        description:
          "Scans a Next.js codebase for costly patterns (caching, dead code, function duration, images, invocations) and generates a health score aimed at reducing your Vercel bill. Built by Vercel itself, so its scoring reflects the platform's own internal cost model rather than a third party's guesswork.",
      },
      {
        title: "visual-diff",
        href: "https://github.com/acoyfellow/visual-diff",
        dateAdded: "2026-07-14",
        description:
          "Visual comparison tool that checks whether two rendered UIs are truly identical across three independent checks: DOM structure, computed styles and pixel-level diff, all three must pass for a match, catching what any single check alone would miss. A tiny, brand-new project (built by acoyfellow, under 20 stars) designed to fail closed rather than report a false match.",
      },
      {
        title: "Playbit",
        href: "https://playbit.app",
        dateAdded: "2026-07-14",
        description:
          "Platform for building 'joyful personal-scale software' once and running it across desktop, web and mobile without a full rebuild. Its runtime acts like a minimal OS kernel, adding sandboxing and collaborative features that don't fit well in a plain browser tab. Currently macOS-only on Apple Silicon, with a capability-based C ABI where every resource is a handle, not a global permission.",
      },
      {
        title: "TUI Studio",
        href: "https://tui.studio",
        dateAdded: "2026-07-14",
        description:
          "Figma-like visual editor for designing terminal UIs with drag-and-drop components, targeting code export to frameworks like Ink, BubbleTea, Blessed and Textual (in alpha). Ships 21 prebuilt components and 8 built-in color themes (Dracula, Nord, Tokyo Night), but code export itself isn't functional yet.",
      },
      {
        title: "Graphify",
        href: "https://graphifylabs.ai",
        dateAdded: "2026-07-14",
        description:
          "Open-source tool that converts a codebase into a knowledge graph AI coding assistants can query, returning explicit graph paths with real file:line citations instead of vague embedding matches. Runs entirely on-device, no account or API key needed. Best suited for large, unfamiliar legacy codebases, where semantic embedding search misses multi-hop call chains a graph traversal catches directly.",
      },
      {
        title: "Pencil",
        href: "https://www.pencil.dev",
        dateAdded: "2026-07-14",
        description:
          "Design tool built around the pitch 'design on canvas, land in code': designs made on a visual canvas translate directly into working code rather than static mockups. Aimed at builders who want to skip the Figma-to-code handoff step entirely, generating shippable components straight from canvas edits.",
      },
      {
        title: "Paper",
        href: "https://paper.design",
        dateAdded: "2026-07-14",
        description:
          "Infinite canvas design tool for teams, positioned between a whiteboard and a full design app for collaborative visual work. Used in production by design teams at Vercel, Perplexity, PostHog, and Tailwind Labs, with native MCP hooks for Claude and Cursor.",
      },
      {
        title: "design.dev",
        href: "https://design.dev",
        dateAdded: "2026-07-14",
        description:
          "Resource hub of code generators, cheat sheets and AI-powered tools for generating design systems and config files, plus a weekly front-end tools newsletter. Subscribing to its newsletter unlocks a bundle of 300 free custom icons alongside the generators.",
      },
      {
        title: "nubjs",
        href: "https://nubjs.com",
        dateAdded: "2026-07-14",
        description:
          "All-in-one Node.js toolkit shipped as a single Rust binary: runs TypeScript directly, manages packages and Node versions, replacing tsx, npm, pnpm and nvm with faster equivalents while staying compatible with the existing ecosystem. Benchmarks show nub installing 1,168 packages in 346ms, over 37x faster than npm, while passing 98.8% of Deno's Node-compat test corpus.",
      },
      {
        title: "Name That UI",
        href: "https://namethatui.com",
        dateAdded: "2026-07-15",
        description:
          "Visual reference for identifying the standard name of an interface element so it is easier to search for, discuss and implement. Currently catalogs 71 elements split between 32 macOS-specific components and 39 general web UI patterns.",
      },
      {
        title: "OpenTUI",
        href: "https://opentui.com",
        dateAdded: "2026-07-15",
        description:
          "Framework for building rich terminal interfaces with TypeScript, giving terminal apps a component model closer to modern web frameworks. Built by the SST team behind terminal.shop and OpenCode, with a native Zig core exposed through a C ABI for other languages.",
      },
      {
        title: "Fallow Tools docs",
        href: "https://docs.fallow.tools",
        dateAdded: "2026-07-14",
        description:
          "Documentation site for the Fallow developer tools suite, covering setup, integrations and usage. Runs with zero config via a single `npx fallow`, combining static dead-code/duplication analysis with optional runtime coverage evidence.",
      },
      {
        title: "SurveyJS library",
        href: "https://github.com/surveyjs/survey-library",
        dateAdded: "2026-07-14",
        description:
          "Open-source JavaScript survey and form builder, for embedding complex, logic-driven forms directly in your own app. MIT-licensed and self-hosted, so there's no cap on forms, submissions, or file uploads, plus built-in e-signature and image-capture field types.",
      },
      {
        title: "ties (raffomania)",
        href: "https://github.com/raffomania/ties",
        dateAdded: "2026-07-14",
        description:
          "CLI tool for managing symlinked dotfiles, keeping your config files in one repo and symlinked into place across machines. Actually a Rust/axum federated bookmarking network, not a dotfiles tool, shipping as one binary with htmx and Tailwind baked in, no Node.js needed.",
      },
      {
        title: "html2rss",
        href: "https://github.com/html2rss/html2rss",
        dateAdded: "2026-07-14",
        description:
          "Turns any webpage into an RSS feed by scraping its structure, useful for sites that don't publish a feed of their own. This Ruby gem can auto-detect feeds via Schema.org and JSON-LD with zero CSS selectors, falling back across Faraday, Botasaurus, and Browserless when blocked.",
      },
      {
        title: "ToolmateX",
        href: "https://toolmatex.com",
        dateAdded: "2026-07-14",
        description:
          "Collection of free, ad-free browser utilities for developers, designers and data people: code formatting, color conversion, text manipulation and security tools, most working fully offline. Among its 60-plus free, no-login tools is a color blindness simulator showing how a design reads to users with color vision deficiency.",
      },
      {
        title: "JSON for You",
        href: "https://json4u.com",
        dateAdded: "2026-07-14",
        description:
          "JSON formatter, viewer and validator for cleaning up and inspecting JSON payloads. Lets you run real jq queries from its search bar and does structural, not just text, diffing between two JSON documents.",
      },
      {
        title: "GitInspect",
        href: "https://www.gitinspect.com",
        dateAdded: "2026-07-14",
        description:
          "Visualizes and inspects Git repository history for understanding how a codebase evolved over time. Lets you chat with an AI directly about any GitHub repo's codebase and history, not just view static timeline charts.",
      },
      {
        title: "opensrc (Vercel Labs)",
        href: "https://github.com/vercel-labs/opensrc",
        dateAdded: "2026-07-14",
        description:
          "Vercel Labs experiment for open-source contribution tooling, exploring ways to make it easier to find and ship OSS contributions. Vercel Labs repo with 2.8k GitHub stars, built as a Rust CLI (55.8% of code) plus TypeScript, caching npm/PyPI/crates.io/GitHub source instantly after first fetch.",
      },
      {
        title: "almostnode",
        href: "https://almostnode.dev",
        dateAdded: "2026-07-14",
        description:
          "Runs Node.js, Next.js, Vite and Express entirely in the browser with no backend server, using a virtual filesystem and shimmed Node modules, useful for interactive demos and playgrounds. Only about 250KB gzipped versus WebContainers' ~2MB, built by the Macaly.com team, ships 40+ shimmed Node modules like fs and crypto.",
      },
      {
        title: "Ultracite",
        href: "https://www.ultracite.ai",
        dateAdded: "2026-07-14",
        description:
          "Zero-config Biome preset for linting and formatting, drop it in and get a sensible, opinionated ruleset without hand-tuning config. Built by Hayden Bleasel, now spans Biome, ESLint, and Oxlint with auto-generated config for 40+ AI agents and 10+ editors.",
      },
      {
        title: "gists.sh",
        href: "https://gists.sh",
        dateAdded: "2026-07-14",
        description:
          "Cleaner viewer for GitHub Gists: swap 'gist.github.com' for 'gists.sh' in any Gist URL to get a minimal, formatted view with dark mode and display options. Built by Fabrizio Rinaldi (@linuz90), fetches gists live from the GitHub API with nothing stored server-side, auto-noindexing secret gists.",
      },
      {
        title: "itty.dev",
        href: "https://itty.dev",
        dateAdded: "2026-07-14",
        description:
          "Family of ultra-small web dev libraries (itty-router, itty-fetcher, itty-time) optimized to run in a few hundred bytes each, built for serverless and edge environments where bundle size directly affects cost. Built solo by Kevin Whitley; itty-time alone claims to be roughly 3x smaller than the popular ms library it replaces.",
      },
      {
        title: "Diffs",
        href: "https://diffs.com",
        dateAdded: "2026-07-14",
        description:
          "Tool for comparing and sharing text and code diffs via a link. Made by Pierre Computer Company using Shiki highlighting and Shadow DOM rendering, with a built-in merge-conflict resolution UI, not just plain diffs.",
      },
      {
        title: "RSSHub docs",
        href: "https://docs.rsshub.app",
        dateAdded: "2026-07-14",
        description:
          "Documentation for RSSHub, the open-source project that generates RSS feeds from almost any site, even ones that don't publish one natively. Licensed AGPL-3.0 with over 1,300 contributors, RSSHub bills itself as the world's largest RSS network rather than a single feed generator.",
      },
      {
        title: "Web Check",
        href: "https://web-check.xyz",
        dateAdded: "2026-07-14",
        description:
          "Runs a full OSINT and security check on any website: DNS records, headers, certificates, hosting and more, in one report. Built by developer Alicia Sykes (Lissy93) as an open-source project you can self-host via Docker instead of relying on the hosted instance.",
      },
      {
        title: "Visual JSON",
        href: "https://visual-json.dev",
        dateAdded: "2026-07-15",
        description:
          "Interactive JSON editor with tree and raw views for reading and editing files like package.json without hand-editing brackets and commas. Built by Vercel Labs on Next.js 15 and React 19, with a Cmd+K 'Ask AI' command for querying the JSON structure directly.",
      },
      {
        title: "Portless",
        href: "https://portless.sh",
        dateAdded: "2026-07-15",
        description:
          "Replaces localhost port numbers with stable, named .localhost URLs for local dev, with HTTPS and HTTP/2 on by default via a reverse proxy. Built by Vercel Labs (vercel-labs/portless, 10k+ GitHub stars); it also auto-prefixes git worktree branch names as subdomains to avoid port collisions.",
      },
      {
        title: "shadcn CLI v4",
        href: "https://ui.shadcn.com/docs/changelog/2026-03-cli-v4",
        dateAdded: "2026-07-15",
        description:
          "shadcn init now scaffolds full project templates (Next.js, Vite, Laravel, React Router, Astro, TanStack Start) plus shadcn/skills and presets, not just individual components. Adds a `--preset` flag that packs an entire design system (colors, theme, icons, fonts, radius) into one shareable code, plus a `registry:font` item type.",
      },
      {
        title: "shadcn registry include and validate",
        href: "https://ui.shadcn.com/docs/changelog/2026-05-registry-include",
        dateAdded: "2026-07-15",
        description:
          "Lets registry authors split a large registry.json across files and validate a source registry before publishing, directly relevant to maintaining a shadcn-based component registry. New `shadcn build` command resolves nested `include` registries into one flattened registry.json, separate from the `registry validate` check itself.",
      },
      {
        title: "Create v1",
        href: "https://github.com/midday-ai/v1",
        dateAdded: "2026-07-15",
        description:
          "Open-source production SaaS starter by Pontus Abrahamsson's Midday team: Next.js, Turborepo, Supabase and shadcn/ui, with i18n, email, analytics and background jobs pre-wired. This repo has since been renamed and repurposed as Packrun, an npm registry/comparison tool for AI agents, so the original SaaS-starter content no longer lives at this URL.",
      },
      {
        title: "create-t3-app",
        href: "https://create.t3.gg",
        dateAdded: "2026-07-15",
        description:
          'CLI maintained by Theo Browne and collaborators that scaffolds a typesafe Next.js app combining tRPC, Tailwind CSS, Auth.js and a choice of Prisma or Drizzle for the ORM. Explicitly rejects all-in-one bundling, its own docs state it is "NOT an all-inclusive template" and expects you to bring your own extra libraries.',
      },
      {
        title: "Varlock",
        href: "https://varlock.dev",
        dateAdded: "2026-07-15",
        description:
          "Schema-first environment variable and secrets manager: a committable .env.schema defines types, validation and defaults, and the CLI resolves real values while redacting secrets from logs. Built by DMNO Inc., its `varlock scan` command specifically flags secrets before they leak into AI agent context windows, not just logs.",
      },
      {
        title: "uv",
        href: "https://docs.astral.sh/uv/",
        dateAdded: "2026-07-15",
        description:
          "Rust-built Python package and project manager from Astral that replaces pip, poetry, pyenv and virtualenv with one tool, with a lockfile and built-in Python version management. Made by Charlie Marsh, creator of the Ruff linter, ships as a single static binary and reports 10-100x faster installs than pip.",
      },
      {
        title: "ty",
        href: "https://docs.astral.sh/ty/",
        dateAdded: "2026-07-15",
        description:
          "Astral's Rust-based Python type checker and language server, positioned as a much faster alternative to mypy and Pyright. Astral benchmarks ty at 10-100x faster than mypy and Pyright on the home-assistant codebase, though it's still pre-1.0.",
      },
      {
        title: "Wrangler",
        href: "https://developers.cloudflare.com/workers/wrangler/",
        dateAdded: "2026-07-15",
        description:
          "Cloudflare's primary CLI for developing and deploying Workers, D1, Containers and Queues. Open source on GitHub, Wrangler also scaffolds new projects through `create-cloudflare` (C3) and manages local KV, R2, and Durable Object bindings.",
      },
      {
        title: "Answer Overflow",
        href: "https://www.answeroverflow.com",
        dateAdded: "2026-07-15",
        description:
          "Turns Discord thread content into indexable, searchable web pages, used by communities like Cloudflare, Nuxt and Valorant to make help-channel answers findable via search engines. Founded by Rhys Sullivan and open source under AGPL, it requires no migration: install the bot and it starts indexing existing threads automatically.",
      },
      {
        title: "Shiptalkers",
        href: "https://shiptalkers.dev",
        dateAdded: "2026-07-15",
        description:
          "Pulls GitHub and social activity into a ranked comparison of how much people actually ship versus how much they post about shipping, by Rhys Sullivan. Built with Astro and open-sourced on GitHub, so anyone can self-host it or fork the ranking algorithm.",
      },
      {
        title: "UnoCSS",
        href: "https://github.com/unocss/unocss",
        dateAdded: "2026-07-15",
        description:
          "Atomic CSS engine by Anthony Fu with no core utilities of its own, generating classes on demand through presets like Wind4 and Mini. Claims to be 5x faster than Windi CSS or Tailwind's JIT engine, while shipping at roughly 6kb min+brotli with zero dependencies.",
      },
      {
        title: "Vitest",
        href: "https://github.com/vitest-dev/vitest",
        dateAdded: "2026-07-15",
        description:
          "Vite-native test runner with a Jest-compatible API, in-source testing and a real browser mode. Ships built-in benchmarking via Tinybench, so performance tests can live alongside unit tests in the same test run.",
      },
      {
        title: "tsdown",
        href: "https://github.com/rolldown/tsdown",
        dateAdded: "2026-07-15",
        description:
          "TypeScript library bundler built on Rolldown, the Rust bundler from the former VoidZero, positioned as a faster tsup replacement. Has racked up 196 published releases and 4.2k GitHub stars, signaling the fast iteration pace typical of Rolldown-ecosystem tooling.",
      },
      {
        title: "taze",
        href: "https://github.com/antfu-collective/taze",
        dateAdded: "2026-07-15",
        description:
          "CLI by Anthony Fu that checks and bumps package.json dependency versions with a mode-based range filter (major, minor, patch) in an interactive terminal UI. Supports monorepos out of the box via a -r flag that scans every package.json across workspaces, including local private packages.",
      },
      {
        title: "ni",
        href: "https://github.com/antfu-collective/ni",
        dateAdded: "2026-07-15",
        description:
          "Package-manager-agnostic CLI (ni, nr, nun, nlx) that detects a repo's lockfile and dispatches to npm, yarn, pnpm or bun automatically. Built by Anthony Fu's antfu-collective; supports pnpm workspace catalog mode, auto-writing `catalog:` references instead of pinned versions across monorepos.",
      },
      {
        title: "vite-plugin-inspect",
        href: "https://github.com/antfu-collective/vite-plugin-inspect",
        dateAdded: "2026-07-15",
        description:
          "Vite plugin that exposes an inspector UI showing each intermediate transform step a module goes through across the full plugin pipeline. Plugs into the @vitejs/devtools panel (v0.4.0+) and can inspect build-mode transforms too, emitting a standalone client into a .vite-inspect folder.",
      },
      {
        title: "Nuxt DevTools",
        href: "https://github.com/nuxt/devtools",
        dateAdded: "2026-07-15",
        description:
          "In-browser devtools overlay for Nuxt apps showing pages, components, composables, server routes and the Vite module graph. Enabled by default since Nuxt v3.8.0 and opened in-app with the Shift+Option+D shortcut, no separate browser extension required.",
      },
      {
        title: "UnJS",
        href: "https://unjs.io",
        dateAdded: "2026-07-15",
        description:
          "Umbrella org for framework-agnostic JS utilities extracted from Nuxt (h3, ofetch, unbuild, unstorage and others), each independently usable outside Nuxt or Vue. Spans roughly 63 actively maintained packages pulling over 420 million monthly downloads and 49k combined GitHub stars across the org.",
      },
      {
        title: "h3",
        href: "https://github.com/unjs/h3",
        dateAdded: "2026-07-15",
        description:
          "Minimal, composable HTTP server framework from UnJS that runs on Node, Deno, Bun and edge runtimes, and serves as Nitro's request layer. Maintained by Nuxt core dev pi0 (Pooya Parsa); h3 v2 is now powered internally by Srvx for its runtime-agnostic request handling.",
      },
      {
        title: "unstorage",
        href: "https://github.com/unjs/unstorage",
        dateAdded: "2026-07-15",
        description:
          "Async key-value storage API with one interface across 20+ drivers (filesystem, Redis, S3, Cloudflare KV, memory), mountable per-namespace and swappable without code changes. Built by the unjs/Nuxt team and powers Nitro's built-in server cache and Nuxt's useStorage composable under the hood.",
      },
      {
        title: "Nuxt Studio",
        href: "https://content.nuxt.com",
        dateAdded: "2026-07-15",
        description:
          "Free, open-source, self-hostable visual editing module for Nuxt Content sites that edits content directly on the production site. Built by NuxtLabs (the Nuxt core team), edits write straight back to your git repo as commits rather than a separate database.",
      },
      {
        title: "page-speed.dev",
        href: "https://page-speed.dev",
        dateAdded: "2026-07-15",
        description:
          "Daniel Roe's tool for capturing and sharing Core Web Vitals and PageSpeed Insights results as shareable links. Generates a dynamic OG image embedding the actual scores, so shared links show the numbers directly in link previews.",
      },
      {
        title: "vitess-operator",
        href: "https://github.com/planetscale/vitess-operator",
        dateAdded: "2026-07-15",
        description:
          "Kubernetes Operator for deploying and managing Vitess clusters declaratively, PlanetScale's primary open-source infrastructure tool outside the core Vitess project. Written in Go under Apache-2.0, with each release pinned to specific compatible Vitess and Kubernetes version ranges (e.g. v2.16.x targets Vitess v23 and k8s 1.31-1.34).",
      },
      {
        title: "Cobalt2 Theme",
        href: "https://github.com/wesbos/cobalt2-vscode",
        dateAdded: "2026-07-15",
        description:
          "Wes Bos's VS Code, Sublime and iTerm color theme, one of the most-installed themes on the VS Code marketplace. Sits at 805 GitHub stars and 248 forks, and pairs best with Wes Bos's own recommended Operator Mono / Dank Mono font choice.",
      },
      {
        title: "Syntax Snackpack",
        href: "https://syntax.fm/snackpack",
        dateAdded: "2026-07-15",
        description:
          "Syntax.fm's own newsletter, separate from Bytes, for tips, tricks and swag drops distinct from the podcast episode feed. Runs biweekly to roughly 19,640 subscribers and is produced in partnership with Sentry, which is why it offers 15% off Syntax and Sentry swag.",
      },
      {
        title: "Expo Atlas",
        href: "https://github.com/expo/atlas",
        dateAdded: "2026-07-15",
        description:
          "Module-level Metro bundle visualizer that walks Metro's dependency graph to show per-module size and Babel transform output for bundle-size debugging. Ships built into Expo starting SDK 51, so running `EXPO_UNSTABLE_ATLAS=true npx expo start` opens a live bundle view right at localhost:8081/_expo/atlas.",
      },
      {
        title: "Expo Orbit",
        href: "https://github.com/expo/orbit",
        dateAdded: "2026-07-15",
        description:
          "Open-source menu-bar app (React Native and Electron) for one-click install and launch of EAS builds, local .apk/.app files or Snack projects onto simulators and emulators. Cross-platform beyond just macOS, it also installs on Linux and Windows, with a Homebrew formula for the Mac build.",
      },
      {
        title: "React Native Worklets",
        href: "https://docs.swmansion.com/react-native-worklets/",
        dateAdded: "2026-07-15",
        description:
          "Standalone multithreading engine, split out of Reanimated, that lets libraries run JS functions synchronously on separate threads via a shared worklet runtime. Built by Software Mansion as the extracted engine now powering Reanimated, a library used by roughly 90% of React Native developers.",
      },
    ],
  },
  {
    title: "Productivity and business tools",
    links: [
      {
        title: "DynamicLake",
        href: "https://www.dynamiclake.com/",
        dateAdded: "2026-09-02",
        kind: "tool",
        stack: ["macos", "ffmpeg"],
        useFor: [
          "dynamic island mac",
          "macos notch",
          "notch utility",
          "mac menu bar app",
          "liquid glass macos",
        ],
        description:
          "macOS utility that turns the notch area into an interactive Dynamic Island, with a smaller miniLake variant for a less intrusive version of the same thing. Named modules include DynaMusix for music controls and DynaGlance for schedule and weather, alongside drag and drop staging, AirDrop, timers, call handling, battery and calendar alerts, volume and brightness control, and audio and video conversion built on FFmpeg under LGPLv3. A Liquid Glass option restyles the island, with an external-display-only mode available. The footer credits Aviorrok; no pricing, version or macOS requirement is stated on the page, and the FAQ entries about non-notch MacBooks and supported macOS versions are listed without visible answers.",
      },
      {
        title: "Rho",
        href: "https://www.rho.co/",
        dateAdded: "2026-08-31",
        kind: "tool",
        stack: ["fintech", "banking"],
        useFor: [
          "startup business banking",
          "business checking account",
          "corporate cards",
          "startup treasury",
          "incorporate a startup",
          "delaware c corp",
          "bill pay and invoicing",
          "expense management",
        ],
        description:
          "Business banking platform aimed at startups, putting checking, savings, treasury, corporate cards, bill pay and invoicing behind one account, with Delaware C-Corp incorporation filed in about 24 hours. Run by Under Technologies, Inc. DBA Rho Technologies from 100 Crosby Street, New York, and explicit throughout that Rho is a fintech company, not a bank: checking and cards sit with Webster Bank, a division of Santander, savings spreads across American Deposit Management partner banks for up to $75M in FDIC coverage, treasury runs through RBB Treasury LLC, an SEC-registered subsidiary custodied at Apex Clearing and Interactive Brokers, and international payments go through Wise. The fee table is $0 across same-day ACH, wires, checks, subscription, per-user seats and minimum balance, with 1% on foreign currency transfers, an optional $15 SWIFT fee, and treasury management from 0.15% on deposits of $20M or more up to 0.6% below $2M. As of August 2026 the site advertised up to 4.59% on idle cash (4.57% net yield in the product card, the two figures disagree on the page) and up to 2% cashback on Rho Platinum.",
      },
      {
        title: "resurface.blog",
        href: "https://resurface.blog/",
        dateAdded: "2026-08-18",
        kind: "tool",
        useFor: [
          "blog to newsletter",
          "blog into a newsletter",
          "blog archive newsletter",
          "read old essays",
          "old blog posts",
          "daily reading email",
          "paul graham essays",
        ],
        description:
          "Free service that turns someone else's blog archive into a newsletter for yourself: paste a link, pick which days you want mail, and one random old post from that blog arrives at 9am ET on those days. The premise on the page is that the best writing on the internet is buried in the archives, and the front page lists 21 trending authors already wired up, among them Paul Graham, Patrick McKenzie, Sam Altman, Julie Zhuo, Andrew Bosworth, Chris Dixon, Fred Wilson, Nadia Asparouhova, Sequoia and Ramp Engineering. Writers can claim their own blog for a password-protected dashboard showing new subscribers in real time, marked beta. Who runs it is not stated on the site.",
      },
      {
        title: "Supaste",
        href: "https://supaste.com",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["macos"],
        useFor: [
          "clipboard history",
          "clipboard manager",
          "paste history",
          "screenshot history",
          "mac clipboard app",
          "text expander",
          "ocr screenshot",
        ],
        description:
          "Local-first clipboard and screenshot history for macOS: a notch shelf, quick search and inline paste over everything you have copied, with OCR run on screenshots so text sitting inside an image is searchable too. Past plain history it does multi-clip copy that folds several items into one card, inline shortcuts where typing ;welcome expands saved text, clip reminders, grouping by source app, custom categories and sensitive-content detection, plus a built-in color picker, text capture and quick notes. Opens on control-command-V, with control-command-0 through 9 for the last ten clips. Needs macOS Sonoma 14 or later, syncs over iCloud and hooks into Apple Intelligence for rewrite and summarize. Shipped by Solt Wagner next to Cooldock and Screen Movie, sold as a one-time purchase rather than a subscription.",
      },
      {
        title: "Vehla",
        href: "https://vehla.app",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["macos", "mcp", "llm", "ollama", "mlx"],
        useFor: [
          "mac launcher",
          "command palette app",
          "spotlight replacement",
          "keyboard launcher",
          "local llm on mac",
          "window snapping",
          "ai actions on selected text",
          "mac dictation",
        ],
        description:
          "Native macOS command center on option-space: one keyboard-driven palette that launches apps, searches files, snaps windows, holds clipboard history and runs AI actions without switching context. Over 100 native commands sit beside roughly 75 curated AI actions (the page says 73 in one place and 79 in another), plus hold-to-talk dictation, a local index that answers with citations, menu bar hiding, an app uninstaller, a signed extension store and MCP server support. Models are bring your own key across OpenAI, Anthropic, Google, DeepSeek and OpenRouter, or fully local through MLX, Ollama and LM Studio, with keys kept in the macOS Keychain and no inference proxied through Vehla's own servers. Built by Kaila Consulting in Ottawa for Apple Silicon on macOS 15 or later, one-time license covering two Macs.",
      },
      {
        title: "Cooldock",
        href: "https://dock.cool",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["macos"],
        useFor: [
          "mac dock replacement",
          "dock widgets",
          "macos widgets",
          "second dock",
          "customize mac dock",
          "desktop dashboard mac",
          "revenue widget",
        ],
        description:
          "Second macOS dock that sits alongside the system one and fills with live widgets instead of app icons. The set covers system stats, quick toggles, audio controls, clipboard, screenshots, weather and now playing, a pomodoro, water reminder, calendar, reminders and notes, a file shelf and app switcher, and a founder-facing row wired to revenue, social followers, website analytics, Shopify, Resend, Dub, Dodo Payments, Polar, Plausible and DataFast, with GitHub, Linear and Supabase for developers. Supports multiple dock profiles, floating layouts and multiple displays, and needs macOS Sonoma 14 or later. Shipped by Solt Wagner alongside Supaste and Screen Movie as a one-time purchase.",
      },
      {
        title: "Invoicely",
        href: "https://invoicely.gg/",
        dateAdded: "2026-07-19",
        description:
          "Free open source invoice generator by Gurbinder (Legions Developer) for creating professional, well-designed invoices with no fees or usage limits. Lets you choose local or server-side storage, does no tracking or data selling, and is sponsored through the open source programs of Vercel, NeonDB and Cloudflare.",
      },
      {
        title: "getprojekt",
        href: "https://www.getprojekt.com",
        dateAdded: "2026-07-14",
        description:
          "Design-engineered project management tool ('Design Engineered' is its own tagline), aimed at freelancers and small teams. The 'Design Engineered' tagline signals a solo/indie-maker build philosophy, betting on visual craft over the feature sprawl of Asana or Monday.",
      },
      {
        title: "Galaxybrain",
        href: "https://galaxybrain.com",
        dateAdded: "2026-07-14",
        description:
          "Local-first information management tool combining document writing with spreadsheet-style calculations, a 'digital brain' for organizing files entirely on your desktop with no account or cloud storage required. Built by Jon-Paul Wheatley and still in 0.9.5 beta, currently desktop-only with support via a public Discord rather than a ticketing system.",
      },
      {
        title: "Invoice Builder",
        href: "https://github.com/piratuks/invoice-builder",
        dateAdded: "2026-07-14",
        description:
          "Open-source invoice generator for creating and exporting invoices without a paid SaaS subscription. MIT-licensed Electron/React app with 457 GitHub stars that exports Peppol BIS Billing 3.0 / UBL 2.1 XML for e-invoicing compliance, not just PDFs.",
      },
      {
        title: "Gmail Cleaner",
        href: "https://gururagavendra.github.io/gmail-cleaner",
        dateAdded: "2026-07-14",
        description:
          "Browser tool for bulk-cleaning a Gmail inbox, finding and clearing out clutter faster than Gmail's own search-and-delete flow. Open-source with 600+ GitHub stars, it batches Gmail API calls 100 messages at a time so bulk unsubscribes and size-based purges finish fast.",
      },
      {
        title: "Kanba",
        href: "https://www.kanba.co",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source Kanban-style project management app for teams tracking and collaborating on work transparently. Positions itself as a lighter, self-hostable alternative to Trello or Asana for teams that want kanban boards without per-seat SaaS pricing.",
      },
      {
        title: "RxResume",
        href: "https://rxresu.me",
        dateAdded: "2026-07-14",
        description:
          "Free, open-source resume builder with a live preview editor and multiple export formats, an alternative to paid resume-builder SaaS. Made by Amruth Pillai (Reactive Resume), it has 39.7k GitHub stars and lets you self-host via Docker with Postgres for full data ownership.",
      },
      {
        title: "Invoicely",
        href: "https://invoicely.gg",
        dateAdded: "2026-07-14",
        description:
          "Simple online invoicing tool for creating and sending invoices without heavier accounting software. Completely free with no paid tiers, open source on GitHub, and keeps invoice data local or user-controlled rather than on vendor servers.",
      },
      {
        title: "Remote Storage",
        href: "https://remote.storage",
        dateAdded: "2026-07-14",
        description:
          'Open protocol (remoteStorage) for per-user, per-app data storage that the user controls, letting apps read and write to a storage location the person owns rather than the app vendor. Predates today\'s local-first wave: created by Michiel de Jong around 2010 as part of the "unhosted web apps" movement.',
      },
      {
        title: "Domain Locker",
        href: "https://domain-locker.com",
        dateAdded: "2026-07-14",
        description:
          "Dashboard for tracking every domain you own across registrars in one place, with monitoring, renewal alerts, and security and performance insights. MIT-licensed and self-hostable for free, with a hosted free tier covering up to 5 domains before paid plans kick in.",
      },
      {
        title: "Domain SDK",
        href: "https://www.domain-sdk.dev",
        dateAdded: "2026-07-14",
        description:
          "TypeScript library for managing custom domains in a SaaS app: one API to add, verify, monitor and remove customer domains across hosting platforms like Vercel, Cloudflare and Railway, with honest status reporting on DNS routing, ownership and TLS certificates. Ships as the open-source npm package @opencoredev/domain-sdk from OpenCore Dev, covering exactly five hosts: Vercel, Cloudflare, Railway, Render, and Netlify.",
      },
      {
        title: "Resume Matcher",
        href: "https://resumematcher.fyi",
        dateAdded: "2026-07-14",
        description:
          "Matches your resume against a specific job description using AI, highlighting gaps and keyword mismatches before you apply. Open source and free forever, no paywall, with no premium tier gating the ATS keyword-matching or scoring features.",
      },
    ],
  },
  {
    title: "File sharing and conversion tools",
    links: [
      {
        title: "SVG Genie PNG to SVG",
        href: "https://www.svggenie.com/tools/png-to-svg",
        dateAdded: "2026-08-05",
        useFor: [
          "png to svg",
          "raster to vector",
          "vectorize an image",
          "image to svg",
          "trace a logo",
          "convert to svg",
        ],
        description:
          "Raster tracer that turns an image into vector paths, aimed at logos, icons and line art rather than photographs, which the page tells you to send to its AI generator instead. It accepts PNG, JPG and WebP despite the name, allows three conversions a day without an account, and puts higher-quality AI conversion behind a paid plan. No tracing controls are exposed, no color count, threshold or path smoothing, just a drop zone and a convert button, though the FAQ says you can describe the image in text for better results; output opens in Illustrator, Figma or the site's own SVG editor. The page claims it works in your browser while also describing an AI processing step, so assume the upload leaves your machine; no maker or company is named anywhere on the site, and sibling tools cover JPG to SVG, SVG to PNG, an SVG editor and an offline desktop app for batches.",
      },
      {
        title: "FileMock",
        href: "https://filemock.com",
        dateAdded: "2026-07-14",
        description:
          "Free, browser-based tool for generating test files (video, audio, image, document) in multiple formats with precise size control, for testing uploads, APIs, storage and media pipelines. Generation happens entirely client-side, nothing leaves the browser. Can generate files up to 2000 MB and even fakes EXIF camera metadata in JPEGs for realistic upload-testing scenarios.",
      },
      {
        title: "convert (p2r3)",
        href: "https://github.com/p2r3/convert",
        dateAdded: "2026-07-14",
        description:
          "Simple command-line file conversion tool for quickly switching between common file formats. Runs entirely in the browser via WebAssembly, converting even across wildly different types like video to PDF, no upload required.",
      },
      {
        title: "Transfer.zip",
        href: "https://transfer.zip",
        dateAdded: "2026-07-14",
        description:
          "Send large files via a link without creating an account, an alternative to WeTransfer for quick one-off transfers. Free tier has no file size cap at all, versus WeTransfer's 3GB limit, and the codebase is fully open source.",
      },
      {
        title: "PNG to ICO",
        href: "https://png-to-ico.com",
        dateAdded: "2026-07-14",
        kind: "tool",
        useFor: ["favicon convert", "png to ico", "make favicon"],
        description:
          "Converts PNG images into ICO favicons directly in the browser. Lets you style the icon differently for browser tabs versus Google search results, generating six sizes in one download.",
      },
      {
        title: "Image Compress",
        href: "https://imgcompress.karimzouine.com",
        dateAdded: "2026-07-14",
        description:
          "Free browser-based image compressor for shrinking file size before upload. Self-hosted Docker tool from creator Karim Zouine, supporting 70+ formats plus local AI background removal with zero cloud calls.",
      },
      {
        title: "One Time Secret",
        href: "https://onetimesecret.com",
        dateAdded: "2026-07-14",
        description:
          "Share a password or secret via a link that self-destructs after being viewed once, so it never sits readable in chat history. Open source (GitHub: onetimesecret/onetimesecret), and decryption keys live only on the app server, never in the database, limiting breach exposure.",
      },
      {
        title: "Oneshot.zip",
        href: "https://oneshot.zip",
        dateAdded: "2026-07-14",
        description:
          "One-off file sharing tool for sending a file via a single-use link. Skips accounts and dashboards entirely: paste or drop a file, get one link, no size-tier upsell like file.io or WeTransfer.",
      },
      {
        title: "Table Format Converter",
        href: "https://www.tableformatconverter.com",
        dateAdded: "2026-07-14",
        description:
          "Free tool for converting tabular data between CSV, HTML, JSON, Markdown and more, running fully client-side so data never leaves your browser. Built by Durandal GmbH in Switzerland, offering all 16 conversion combinations across CSV, HTML, JSON, and Markdown with live real-time preview.",
      },
      {
        title: "Bento PDF",
        href: "https://bentopdf.com",
        dateAdded: "2026-07-14",
        description:
          "Free set of browser-based PDF editing tools: merge, split, compress and edit PDFs without uploading to a paid service. Open-source and MIT-licensed, built on pdf-lib and pdf.js so every merge, split, and edit runs entirely client-side with no server round trip.",
      },
      {
        title: "8mb",
        href: "https://8mb.campuscal.tech",
        dateAdded: "2026-07-14",
        description:
          "File compressor built specifically for squeezing files under Discord's 8MB upload limit. Self-hosted and GPU-accelerated video compressor, so you can run your own instance instead of trusting a third party with your clips.",
      },
      {
        title: "Online-Convert",
        href: "https://www.online-convert.com",
        dateAdded: "2026-07-14",
        description:
          "Free online file format converter supporting a wide range of document, image, audio and video formats. Also ships Chrome, Firefox, and Edge browser extensions (300,000+ Chrome users) plus OCR tools for image and PDF to text conversion.",
      },
    ],
  },
  {
    title: "ASCII art and diagram tools",
    links: [
      {
        title: "Excalidraw",
        href: "https://excalidraw.com",
        dateAdded: "2026-07-21",
        description:
          "A virtual whiteboard for sketching hand-drawn-looking diagrams, wireframes, and charts in the browser with no account needed. Created in January 2020 by Christopher Chedeau (co-creator of React Native and Prettier) and now maintained by Excalidraw s.r.o. in Brno; MIT licensed and written in TypeScript and React. Supports real-time collaboration with client-side end-to-end encryption, pasting spreadsheet or CSV data to generate charts, and a growing asset library at libraries.excalidraw.com.",
      },
      {
        title: "ASCII Magic",
        href: "https://www.ascii-magic.com/",
        dateAdded: "2026-07-19",
        description:
          "Free in-browser image and video stylizer by Kailash that turns any photo or video into ASCII art, pixel art, voxel, mosaic, halftone, glitch or LEGO. Thirteen styles with real time preview, post effects like bloom, CRT, scanlines and vignette, 19 one-click recipe deep links, and export at up to 4x resolution, all without uploads or an account.",
      },
      {
        title: "Text Paint",
        href: "https://textpaint.com",
        dateAdded: "2026-07-14",
        description:
          "Draw pixel art directly using text characters, exportable as plain text or copy-pasted ASCII art. Lets you paint with Unicode and emoji, not just ASCII, and exports as HTML or JavaScript in addition to plain text, no signup needed.",
      },
      {
        title: "Video to ASCII (ezascii)",
        href: "https://ezascii.com/video-to-ascii",
        dateAdded: "2026-07-14",
        description:
          "Converts an uploaded video into playable ASCII art, frame by frame. One of a small family of single-purpose ezascii tools from the same maker, alongside separate image-to-ASCII and webcam-to-ASCII converters.",
      },
      {
        title: "ASCII Art Club",
        href: "https://asciiart.club",
        dateAdded: "2026-07-14",
        description:
          "Community gallery of user-submitted ASCII art for browsing and sharing. Splits its gallery into four curated categories, Photos, Graphics, Selfies, and Artwork, with an ad-free membership tier via Patreon for $3/month.",
      },
      {
        title: "Video to ASCII (Melobytes)",
        href: "https://melobytes.com/en/app/video2ascii",
        dateAdded: "2026-07-14",
        description:
          "Another video-to-ASCII converter, turning uploaded clips into ASCII animation. Just one tool inside Melobytes' larger all-in-one AI playground, which also covers text-to-speech, song generation, and image morphing under one account.",
      },
      {
        title: "Text Diagram",
        href: "https://weidagang.github.io/text-diagram",
        dateAdded: "2026-07-14",
        description:
          "Draws boxes-and-arrows diagrams from plain text descriptions, ASCII-art style output for docs and READMEs. Built by Weidagang as an open-source GitHub project focused on sequence diagrams, using arrow syntax like April->Todd between declared objects.",
      },
      {
        title: "Graph::Easy online",
        href: "https://graph-easy.online",
        dateAdded: "2026-07-14",
        description:
          "Browser version of the Perl Graph::Easy tool: describe a graph in simple text syntax and render it as an ASCII or boxed diagram. The original Graph::Easy Perl module (by Tels) can output more than ASCII: HTML, SVG, and Graphviz dot, not just boxed text.",
      },
      {
        title: "Wiretext",
        href: "https://wiretext.app",
        dateAdded: "2026-07-14",
        description:
          "Text-based wireframing tool: sketch the simplest possible wireframe using Unicode UI shapes and keyboard shortcuts, then export it as plain text or markdown for sharing. Ships an MCP server with create_wireframe/render_wireframe tools, so Claude and other AI assistants can generate wireframes programmatically, not just humans.",
      },
      {
        title: "nomnoml",
        href: "https://nomnoml.com",
        dateAdded: "2026-07-14",
        description:
          "Draws UML diagrams from a simple text syntax, type a description and get a rendered class/sequence diagram. Made by Daniel Kallin (skanaar on GitHub); one syntax covers class, component, flowchart, and use-case diagrams, saved locally in the browser.",
      },
      {
        title: "Monosketch",
        href: "https://monosketch.io",
        dateAdded: "2026-07-14",
        description:
          "Draw ASCII and box diagrams directly in the browser with a proper drag-and-drop editor instead of hand-typing characters. Apache 2.0 licensed, built by tuanchauict after he found existing ASCII tools inadequate, and funded via GitHub Sponsors and Ko-fi.",
      },
    ],
  },
  {
    title: "Marketing and growth tools",
    links: [
      {
        title: "swiped.",
        href: "https://swiped.design/",
        dateAdded: "2026-08-31",
        kind: "gallery",
        useFor: [
          "design content swipe file",
          "linkedin post examples",
          "x post examples",
          "content for designers",
          "grow a design audience",
          "social post inspiration",
          "what designers post",
        ],
        description:
          "Weekly swipe file of design-world content that performed well on X and LinkedIn, aimed at designers writing their own posts rather than at visual reference. Entries are hand-picked, best performers only, and split into This week, Last week and an Archive, with a source filter for All, X or LinkedIn and command-K search. Each item carries Copy prompt next to Open original post, so the structure of a post can go straight into your own draft, and arrow keys, Enter and Escape drive the whole wall from the keyboard. Made by brandedwords.studio; no item counts, pricing, submission form or email signup appear on the page despite the weekly framing.",
      },
      {
        title: "H1 Gallery",
        href: "https://h1gallery.com/",
        dateAdded: "2026-08-07",
        kind: "gallery",
        useFor: [
          "marketing headlines",
          "landing page headlines",
          "product headlines",
          "headline inspiration",
          "marketing copy examples",
          "saas headlines",
          "copywriting reference",
          "homepage headlines",
        ],
        description:
          "Curated archive of marketing H1 headlines, useful when you need real product copy examples rather than abstract copywriting tips. Catalogued as numbered entries from H-1 (Basecamp) through at least H-220 (EasyCircuit), each pairing the headline with the product name, spanning SaaS, consumer apps and hardware. Curated by Corey Haines and team (Conversion Factory); a free Friday email sends three headlines with analysis and founder comments, and the project is on X as @h1gallery.",
      },
      {
        title: "Post Window for X",
        href: "https://postwindow.vercel.app/",
        dateAdded: "2026-07-23",
        description:
          "Timezone-overlap tool that recommends when to post on X for an audience in another region: pick your city and weight your audience regions, and it renders a day-by-hour activity heatmap, recommended posting windows converted to your local time, and the dead zones to avoid. Benchmarks come from Buffer, Hootsuite and Sprout Social 2026 engagement data, and the page is explicit that the numbers are modeled estimates for illustrating timezone overlap, not platform analytics.",
      },
      {
        title: "OpenSEO",
        href: "https://github.com/every-app/open-seo",
        dateAdded: "2026-07-21",
        description:
          "Open-source, self-hostable SEO platform pitched as a pay-as-you-go alternative to Semrush and Ahrefs, covering keyword research, rank tracking, competitor analysis, backlinks, site audits, and AI visibility. Maintained by Every (every-app), written almost entirely in TypeScript, and deployable via Docker or Cloudflare. You bring your own DataForSEO API key and pay only for usage rather than a subscription, and an MCP server lets agents like Claude Code query the SEO data directly. MIT licensed, around 6.3k stars.",
      },
      {
        title: "Seolo blog",
        href: "https://www.seolo.live/blogs",
        dateAdded: "2026-07-14",
        description:
          "SEO blog covering technical SEO, JavaScript SEO, crawling and indexing, and AI-driven search strategy, practical tutorials over generic advice. Written by Deep Panchal, and pairs the blog with a free instant site audit tool rather than gated lead-gen forms.",
      },
      {
        title: "WinWinKit",
        href: "https://winwinkit.com",
        dateAdded: "2026-07-14",
        description:
          "Marketing platform for app developers to run affiliate campaigns, referral programs and promo codes, handling tracking, rewards and payouts across iOS, Android and desktop. Ships native Swift, Kotlin, Dart and TypeScript SDKs, plugs straight into RevenueCat entitlements, and holds affiliate earnings 14 days before payout.",
      },
      {
        title: "EmailMD",
        href: "https://www.emailmd.dev",
        dateAdded: "2026-07-14",
        description:
          "Write responsive HTML emails using Markdown syntax instead of hand-coding table-based HTML, with an AI-assisted MCP integration for writing, linting and previewing emails live. Built by Anypost, open source, and its MCP server plugs into Claude Code, ChatGPT, Cursor and VS Code, not just one AI client.",
      },
      {
        title: "Autosend",
        href: "https://autosend.com",
        dateAdded: "2026-07-14",
        description:
          "Automated email sending platform for scheduling and delivering transactional or campaign email. Prices per email sent, not per contact stored, starting at $1/month for 3,000 emails, and can also receive and auto-reply to inbound mail via API.",
      },
      {
        title: "Unosend",
        href: "https://www.unosend.co",
        dateAdded: "2026-07-14",
        description:
          "Transactional email sending service for delivering app-generated emails like receipts and password resets. Positions itself as a lean, no-frills alternative to heavier ESPs, aimed squarely at developers who just need reliable transactional sending, not a marketing suite.",
      },
      {
        title: "Typefully",
        href: "https://typefully.com",
        dateAdded: "2026-07-14",
        description:
          "Twitter/X thread writing and scheduling tool with a distraction-free composer built specifically for threads rather than single posts. Ships an official MCP server (mcp.typefully.com) plus a public agent-skills repo, letting AI agents draft, edit, and schedule threads directly.",
      },
    ],
  },
  {
    title: "Effect ecosystem",
    links: [
      {
        title: "Effect v3 to v4 migration skill",
        href: "https://www.skills.sh/effect-ts/skills/effect-v3-to-v4",
        dateAdded: "2026-08-14",
        kind: "skill",
        stack: ["effect", "typescript", "agents", "migration"],
        useFor: [
          "effect v3 to v4",
          "effect v4 migration",
          "migrate to effect v4",
          "upgrade effect",
          "effect breaking changes",
          "effect v4",
        ],
        description:
          "Agent skill from the Effect-TS org itself that drives an Effect v3 to v4 migration off the generated migration reference shipped in the Effect repo, so every rename, removal and signature change is answered by upstream data instead of guessed. The workflow makes two shallow single-branch clones (v4 `main` plus the `v3` branch for old semantics), migrates `package.json` before the first type-check so the error list is not drowned in unresolved imports from packages that no longer exist, then works `tsc --noEmit` down to zero, delegating per-file fixes to sub-agents and prohibiting silencing an error instead of resolving it. Its load-bearing rule is never to read `migration/v3-to-v4.md` whole: at roughly 16,000 lines and 350k tokens it takes the context window with it, so each symbol is grepped one lookup at a time out of the Import Map, No Counterpart Imports, Removed Modules or API Reference sections. Installed via `npx skills add`, 138 installs and 76 stars on the repo, listed since 27 July 2026; it also warns that a `.repos/effect` left behind from the archived `effect-smol` repo is stale and has to be re-cloned.",
      },
      {
        title: "Crosshatch",
        href: "https://crosshatch.dev/",
        dateAdded: "2026-08-11",
        kind: "library",
        stack: ["x402", "evm", "solana", "stablecoin"],
        useFor: [
          "x402",
          "http 402",
          "pay per request",
          "charge per request",
          "paid api endpoint",
          "pay for llm inference",
          "stablecoin micropayments",
          "agent payments",
        ],
        description:
          "Effect-native toolkit for x402, Coinbase's revival of the HTTP 402 status code, covering both sides of a paid request: a client layer that answers payment challenges on its own, and merchant routes that state a requirement, check the payload, then settle it and attach a settlement header. Published by Crosshatch Labs as a single `crosshatch` package, and Effect-shaped throughout, so accepted assets, signing schemes and mnemonic-backed keys compose as layers (`Payer.layerLocal`, `Erc3009Scheme`, `Permit2Scheme`) instead of arriving as a configured client object, with the payer signing USD stablecoin payloads across EVM and Solana chains from one MNEMONIC variable. The AI client is the sharpest example: piping an `effect/unstable/ai` LanguageModel through the x402 HTTP client bills inference call by call with no account and no API key, shown against Blockrun. Apache-2.0, v0.0.16 and 26 GitHub stars at time of adding, so read the API as unstable.",
      },
      {
        title: "effect-torch",
        href: "https://github.com/mikearnaldi/effect-torch/tree/main",
        dateAdded: "2026-07-27",
        description:
          "Experimental tensor library for TypeScript by Mike Arnaldi, built on Effect over a Rust backend that wraps candle through napi-rs. The stated goal is teaching rather than production use: rebuild the building blocks behind machine learning with an API a TypeScript developer can actually read. Covers tensors and dtypes, a lazy computation graph, device abstraction across CPU, Metal and CUDA, reverse-mode autodiff, shape operations (reshape, transpose, slice, concat, broadcast) and reductions, with typed errors and cancellation inherited from Effect. Created 2026-07-26 with six commits, no license file and 17 stars at time of adding, so read it as a study project, not a dependency.",
      },
      {
        title: "effect-local",
        href: "https://github.com/lucas-barake/effect-local",
        dateAdded: "2026-07-22",
        description:
          "Frontend-only local-first database engine for Effect v4 apps by lucas-barake, where a durable browser replica is authoritative for interactive reads and writes and syncs when a connection exists. Layers Automerge 3.3.2 for canonical document history, SQLite WASM in OPFS (or Node.js SQLite) for projections, Effect Atom for reactive views, and Effect Cluster plus Workflow for durable command processing, with schema-checked mutations and queries via Effect Schema and peer sync that needs no backend server. Beta targeting Effect 4.0.0-beta.99, so formats and APIs can still change; MIT licensed, 18 stars at time of adding.",
      },
      {
        title: "effect-rpc-workers",
        href: "https://github.com/ksamirdev/effect-rpc-workers",
        dateAdded: "2026-07-20",
        description:
          "Reference project by ksamirdev showing how to run @effect/rpc on Cloudflare Workers with end to end type safety and no framework glue. Treats RPC as the typed API boundary, Effect as the execution model for structured concurrency and error handling, and Workers as the runtime, wiring dependency injection and service composition at the edge. Pure TypeScript, pnpm plus Wrangler, ISC licensed, 7 stars at time of adding.",
      },
      {
        title: "learn-effect-stuff",
        href: "https://github.com/jjhiggz/learn-effect-stuff",
        dateAdded: "2026-07-20",
        description:
          "jjhiggz's executable Effect course: you run the lessons rather than read them, since every practice checkpoint is also a Bun test, so the expected behavior is stated in code. Two courses so far, Optics for immutable data manipulation and Fiber Olympics for racing, joining, interrupting and supervising concurrent effects. Challenges run individually, for example `bun run course --course=optics --challenge=6`. Very new (single commit, 1 star), so treat it as a work in progress.",
      },
      {
        title: "Effective Modules",
        href: "https://alexleung.net/tech/effective-modules/",
        dateAdded: "2026-07-20",
        description:
          "Alexander Leung's May 2026 essay on why Effect's own service ergonomics hurt at scale, plus the tool he built to fix them (ozyman42/effective-modules). Names four concrete headaches: Effect.Service coupling implementation to interface (which he calls an anti-pattern), the repetitive Context.Tag syntax it exists to avoid, error noise where one changed signature lights up an entire Layer in the IDE, and verbose dependency passing through layer closures or hand-built Contexts. Written against Effect v3 and v4 with Twoslash-rendered type output, so you can read the inferred types inline. Assumes you already know TypeScript, Effect and SOLID.",
      },
      {
        title: "SER (Svelte Effect Runtime)",
        href: "https://barekey.dev/docs/ser/introduction",
        dateAdded: "2026-07-20",
        description:
          "Vite plugin from Barekey that lets you write Effect code natively inside SvelteKit components, on both client and server. Adds an `effect` script directive so a component can yield services directly in markup, with live queries that update reactively and remote functions covering queries, commands and forms. BSD 3-Clause. Useful if Effect already runs on your backend and you want the same effect system in the UI layer rather than a bridge at the boundary.",
      },
      {
        title: "Minimal Kyo-style effect system (kitlangton)",
        href: "https://gist.github.com/kitlangton/f45697b1f711bcb600ad8f6432b1f75b",
        dateAdded: "2026-07-19",
        description:
          "Kit Langton's single-file TypeScript gist implementing a minimal algebraic effect system in the style of Scala's Kyo: a phantom-row Fx<A, E> type, Suspend objects that capture delimited continuations, a tail-recursive stack-safe interpreter, and Abort, Env and State effects as concrete handler examples. A compact reference for how effect-system internals actually work.",
      },
      {
        title: "Visual Effect playground",
        href: "https://effect.kitlangton.com/",
        dateAdded: "2026-07-14",
        description:
          "Kit Langton's interactive visual playground for the Effect TypeScript library, watch effects, fibers and concurrency execute step by step instead of reading about it abstractly. An independent side project, not an official Effect resource, built to make fiber interruption and racing semantics click before you ever open the docs.",
      },
      {
        title: "Effect",
        href: "https://effect-ts.github.io/effect/",
        dateAdded: "2026-07-14",
        description:
          "Official docs for Effect, the TypeScript library for building robust, type-safe applications with structured concurrency, error handling and dependency injection built into the type system. This is the auto-generated API reference for the core `effect` package itself; it defers guides and examples to effect.website instead of duplicating them.",
      },
      {
        title: "Effect blog and v4 beta updates",
        href: "https://effect.website/blog",
        dateAdded: "2026-07-15",
        description:
          "Official Effect release notes and weekly engineering updates. This is the primary source for the Effect 4 beta runtime rewrite, consolidated packages, new Context.Service model, unstable modules and ongoing breaking API changes. The June 2026 recap alone covers adaptive rate limiting, Schema performance work, OpenTelemetry enhancements, and new SQL additions landing in the v4 beta.",
      },
      {
        title: "Effect v3 to v4 migration guide",
        href: "https://github.com/Effect-TS/effect-smol/blob/main/MIGRATION.md",
        dateAdded: "2026-07-15",
        description:
          "Official migration index for Effect 4 beta, covering renamed and removed APIs across services, errors, schemas, layers, HTTP, streams, schedules and the rest of the rewritten runtime. A compact ~80-line index spanning 12+ topic areas (e.g. Context.Tag to Context.Service) that links out to granular per-feature migration sub-guides.",
      },
      {
        title: "use-effect-ts",
        href: "https://github.com/pkishorez/use-effect-ts",
        dateAdded: "2026-07-15",
        description:
          "Kishore's React hooks for running Effect programs with component scopes, latest-run cancellation, queues and live refs. The repository predates Effect 4, so use it for React integration ideas and verify APIs against the v4 migration guide. The entire library is just six hook files, useComponentScope, useComponentLifecycle, useLiveRef, useRunEffect, useRunEffectLatest, useRunEffectQueue, with zero stars as of writing.",
      },
      {
        title: "Dillon Mulroy's Effect guide",
        href: "https://github.com/dmmulroy/effect.guide",
        dateAdded: "2026-07-15",
        description:
          "Large module-by-module collection of practical Effect guides, testing notes and examples. The author marks it as generated, work in progress and not yet type-checked, so treat it as a discovery index rather than a source of current v4 truth. Tracks completion by the number: all 180 core Effect modules are 100% done, but platform sits at 13/59 and experimental at just 1/24.",
      },
      {
        title: "Dillon Mulroy's Effect Cloudflare experiment",
        href: "https://github.com/dmmulroy/effect-cloudflare",
        dateAdded: "2026-07-15",
        description:
          "Experimental wrappers for Cloudflare KV, D1, R2 and Worker runtime bindings using Effect services. It currently targets Effect 3, but is useful prior art for keeping Cloudflare capabilities behind typed service boundaries. Covers exactly four bindings, D1Database, KVNamespace, R2Bucket and Worker, in a 27-star repo, a minimal reference rather than a full SDK.",
      },
      {
        title: "alchemy-effect",
        href: "https://github.com/dmmulroy/alchemy-effect",
        dateAdded: "2026-07-15",
        description:
          "Dillon Mulroy's experimental Infrastructure-as-Effects project for type-checked infrastructure bindings, deployment plans and testable business logic. The project explicitly warns that it is not production-ready yet. README GIFs demo compile-time IAM policy errors and a reviewable deployment plan, backed by an active Discord for early contributors.",
      },
      {
        title: "better-result",
        href: "https://github.com/dmmulroy/better-result",
        dateAdded: "2026-07-15",
        description:
          "Lightweight Result type for TypeScript with tagged errors, pattern matching and generator-based composition. A useful smaller alternative to compare when a full Effect runtime, services and structured concurrency would be unnecessary. Has crossed 1,585 GitHub stars, far more traction than the other repos here, with docs at better-result.dev covering retry, panic and serialization.",
      },
      {
        title: "Effect runtime visualizer",
        href: "https://effect-viz.vercel.app/",
        dateAdded: "2026-07-14",
        description:
          "Visualizer for how Effect's runtime schedules and executes fibers, for building intuition about Effect's concurrency model. Built by Kit Langton, an Effect core contributor; pairs animated node graphs with synchronized sound feedback as effects race, fork, or fail.",
      },
      {
        title: "Effect Solutions",
        href: "https://www.effect.solutions/",
        dateAdded: "2026-07-14",
        description:
          "Consulting/resource site focused on helping teams adopt and use the Effect TypeScript library well. Ships a concrete 'Quick Start' guide for writing idiomatic Effect programs, aimed at teams evaluating adoption, not just theory.",
      },
      {
        title: "Effect to JS examples",
        href: "https://github.com/bmdavis419/effect-to-js-ex",
        dateAdded: "2026-07-14",
        description:
          "Repository of side-by-side examples translating Effect code to plain JavaScript/TypeScript equivalents, for understanding what Effect is actually doing under its abstractions. Made by Ben Davis (bmdavis419), Theo's channel manager and a YouTuber; a small 8-star, 5-commit reference repo.",
      },
      {
        title: "Effect API example",
        href: "https://github.com/TeamWarp/effect-api-example/blob/main/packages/typescript-config/base.json",
        dateAdded: "2026-07-14",
        description:
          "Example repository showing how to structure an API built with Effect, this link points at its shared TypeScript config. That config sits inside an 80-star Turborepo monorepo pairing @effect/platform HTTP APIs with Drizzle ORM on Bun and Postgres.",
      },
      {
        title: "Effect client wrapper skill",
        href: "https://skills.sh/rhyssullivan/effect-client-wrapper-skill/effect-client-wrapper",
        dateAdded: "2026-07-14",
        description:
          "Claude Code agent skill for generating Effect-based API client wrappers following established Effect patterns. By rhyssullivan (14 stars, 57 installs); standardizes SDK wrapping via Data.TaggedError plus Effect's Context, Layer, Config, and Redacted.",
      },
    ],
  },
  {
    title: "Docs, slides and content tools",
    links: [
      {
        title: "Writer",
        href: "https://writer.computer/",
        dateAdded: "2026-08-10",
        kind: "tool",
        stack: ["tauri", "rust", "react", "codemirror", "zustand", "markdown"],
        useFor: [
          "markdown editor",
          "local first markdown",
          "edit markdown files",
          "desktop markdown app",
          "markdown app for mac",
          "mermaid in markdown",
          "notes next to code",
          "markdown editor for a repo",
        ],
        description:
          "Local-first desktop markdown editor that opens an existing folder of .md files instead of importing them into its own library, so notes can sit inside a git repo next to the code. Built with Tauri v2, React, Zustand, CodeMirror and Rust; it honors the workspace's .gitignore, opens multiple windows for switching between workspaces, and renders extended markdown including tables and Mermaid diagrams. Open source as joelbqz/writer-computer under GPL-3.0 with signed macOS builds, and no Windows or Linux release is published.",
      },
      {
        title: "Underleaf",
        href: "https://underleaf.xyz/",
        dateAdded: "2026-08-03",
        description:
          "Document editor for turning written work into polished PDFs, either manually or through an AI agent that applies plain-English changes after review. Includes starting points for lab reports, academic reports, technical documentation and essays; imports DOCX, PDF and code; supports drag-and-drop media, image cropping and styling, PDF compression, paper-size controls and DOCX export.",
      },
      {
        title: "Presentations.AI",
        href: "https://presentations.ai",
        dateAdded: "2026-07-29",
        description:
          "Generates decks from an idea, a document or a URL, then exports editable PowerPoint rather than locking the result in. Founded in Singapore by Sumanth Raghavendra, Ravi Kasthuri and Saravanan Govindaraj, backed by Together Fund and Accel, and claiming over 12 million teams. The pieces worth knowing are Brand Sync, which applies your logo, fonts and colors automatically, Presentation Refresh for decks wired to live data, and an API for generating decks programmatically. Free tier gives 100 credits a month; Pro is $20/month and Gold $100/month, both billed annually.",
      },
      {
        title: "Gamma",
        href: "https://gamma.app",
        dateAdded: "2026-07-29",
        description:
          "Turns a text prompt into presentations, documents or a simple website, aimed at teams that ship visual documents without a designer on hand. Everything runs on a credit system: roughly 50 credits for a ten-slide deck, 10 to 40 for an advanced AI image. Free gives 400 credits once, not monthly; Plus adds 1,000 credits a month and up to 20 cards per prompt, Pro 4,000 credits and 60 cards, Ultra 20,000 credits, with paid plans starting around $8/month.",
      },
      {
        title: "Slidesgo",
        href: "https://slidesgo.com",
        dateAdded: "2026-07-29",
        description:
          "Presentation templates for Google Slides and PowerPoint, with some editable in Canva, run by Freepik Company as part of its Magnific Projects group. The library is large enough that browsing by category is the point: over 9,800 education templates, 5,300 business, 4,400 minimalist, plus filters on industry, style and color. It also bundles AI utilities around the templates, including a presentation maker, a PDF to PPT converter, a lesson plan generator and a quiz maker. Freemium, with premium templates behind a subscription.",
      },
      {
        title: "Animotion",
        href: "https://animotion.pages.dev/",
        dateAdded: "2026-07-21",
        description:
          "Open source presentation framework for building animated slides in code, for when you want to visualize an idea (a diagram, a code walkthrough, a math concept) rather than lay out static bullet points. Built by Matia of Joy of Code on top of Svelte, Reveal.js and Tailwind, scaffolded with `npm create @animotion`. Transitions between slides are automatic: mark an element with the `animate` property and Animotion tweens it from one slide to the next, so motion comes from the markup instead of a timeline. Ships docs, a Discord, and an examples repository of real decks.",
      },
      {
        title: "Blume CLI",
        href: "https://useblume.dev/cli",
        dateAdded: "2026-07-21",
        description:
          "Open source command-line tool for building and running documentation sites, useful when you want docs scaffolding, a dev server, and production builds from one binary instead of wiring a docs framework yourself. Built by Hayden Bleasel, MIT licensed (version 1.1.2 at time of writing). Ships eleven commands covering init, dev server with hot reload, build, preview, adding components, content sync, ejecting to a standalone Astro app, type-checking pages, diagnostics, link and anchor validation, and a site audit. Comes with four project templates (docs, API, SDK, changelog), a JS performance budget flag, and is designed to work alongside coding agents like Claude Code and Codex.",
      },
      {
        title: "EventCatalog",
        href: "https://www.eventcatalog.dev/",
        dateAdded: "2026-07-20",
        description:
          "Open source, self-hostable documentation platform for event-driven architecture: it models domains, services, events, schemas, data stores, flows and ADRs as one connected graph instead of scattered pages. Docs stay in sync with the source specs through OpenAPI and AsyncAPI, Kafka, and the Confluent, AWS Glue and Azure schema registries, with GitHub and GitLab CI wiring and an MCP server so an agent can answer ownership and impact questions. Roughly 2,700 GitHub stars, 40+ contributors, and 33,000+ catalogs created; listed users include AWS, Nike, GOV.UK, Eurostar, NHS and Costco.",
      },
      {
        title: "Tahta for Slidev",
        href: "https://tahta.cagdas.io/",
        dateAdded: "2026-07-14",
        description:
          "Theme/toolkit for Slidev (the developer-focused, markdown-based slide framework), for building more polished presentation decks. Built by Cagdas Salur: 13 themed variants and 30 layouts, MIT-licensed, with CI gates that enforce WCAG-AA contrast per variant.",
      },
      {
        title: "Reveal.js",
        href: "https://revealjs.com/#/20",
        dateAdded: "2026-07-14",
        description:
          "Long-running, widely used open-source HTML presentation framework, build slide decks in markdown/HTML with built-in transitions, themes and speaker notes. Created by Hakim El Hattab in 2011; it also powers the commercial platform slides.com under the hood.",
      },
      {
        title: "Slidev",
        href: "https://sli.dev/",
        dateAdded: "2026-07-14",
        description:
          "Developer-focused slide deck framework built on markdown and Vue, write slides in a text file, get syntax highlighting, live coding blocks and full styling control. Made by Anthony Fu (antfu) on top of Vite, giving instant HMR for slides the way Vite does for apps.",
      },
      {
        title: "Quarkdown",
        href: "https://quarkdown.com",
        dateAdded: "2026-07-14",
        description:
          "Markdown superset that compiles into fully styled documents, books and slide decks, adding layout and theming on top of plain markdown syntax. By Giorgio Garofalo (iamgio), passed 15,000 GitHub stars, and includes a Turing-complete scripting layer for programmatic documents.",
      },
      {
        title: "getdesign.md",
        href: "https://getdesign.md",
        dateAdded: "2026-07-14",
        description:
          "Turns a markdown file into a polished, styled design document, useful for spec docs and design write-ups that shouldn't look like plain markdown. Maintained by the VoltAgent team, it catalogs 300+ analyzed DESIGN.md files from brands like Figma, Stripe, and Apple.",
      },
      {
        title: "docmd",
        href: "https://docmd.io",
        dateAdded: "2026-07-14",
        description:
          "Turns a markdown source into a full documentation site, similar in spirit to Docusaurus but lighter weight. MIT-licensed and free, ships as ~18kb of framework-free vanilla JS, and auto-generates llms.txt plus an MCP server for AI agents.",
      },
      {
        title: "Accept Markdown",
        href: "https://acceptmarkdown.com",
        dateAdded: "2026-07-14",
        description:
          "Renders a markdown document as a clean, shareable web page without needing a full static site setup. Actually a content-negotiation spec: serves Markdown to AI agents via the Accept header while browsers still get HTML from the same URL.",
      },
    ],
  },
  {
    title: "Personal blogs and sites",
    links: [
      {
        title: "Bartosz Ciechanowski",
        href: "https://ciechanow.ski",
        dateAdded: "2026-08-21",
        kind: "essay",
        stack: ["webgl", "canvas", "svg"],
        useFor: [
          "interactive explainer",
          "explorable explanation",
          "teach a concept visually",
          "interactive diagrams",
          "how things work article",
          "simulation inside an article",
        ],
        description:
          "Bartosz Ciechanowski's blog, the reference point for interactive explainers: each article teaches one physical system through embedded real-time simulations you manipulate rather than static figures. The recurring devices are worth stealing, drag to orbit 3D scenes, sliders for date, time, speed of time, mass, eccentricity and wavelength, paired views showing one moment from the ground and from space at once, a draggable figurine that sets your observer position on the globe with a button to jump it to your real location, and toggles that scale bodies ten times larger so the geometry reads. Subjects include Moon (December 2024), GPS, Earth and Sun, Lights and Shadows, Cameras and Lenses, and Naval Architecture. No framework, library or license is named anywhere on it; support runs through Patreon.",
      },
      {
        title: "Steph Ango",
        href: "https://stephango.com",
        dateAdded: "2026-08-21",
        kind: "essay",
        stack: ["obsidian", "markdown", "jekyll"],
        useFor: [
          "minimal personal site",
          "short essays",
          "note taking philosophy",
          "file over app",
          "plain text workflow",
          "blog design reference",
        ],
        description:
          "Personal site of Steph Ango, who writes as kepano and has been CEO of Obsidian since February 2023, after co-founding Lumi, Inkodye and Slash Packaging and training in biology and industrial design. Read it twice, once for the writing and once for the site, which is the argument of his best-known essay built as a website: plain Markdown authored in Obsidian, compiled by Jekyll, stripped to a Latest post, a Topics index of roughly 30 tags and a reverse chronological archive running back to 2012. That essay is File over app (July 2023), the case that your notes should outlive the software you wrote them in. Titles stay short and aphoristic, Use the saw fear the saw, Design is compromise, Great tools choose to be bad at some things, Calmness is a superpower, next to 40 questions to ask yourself every year and How I use Obsidian. He also made the Minimal theme, the Flexoki colour scheme and the open JSON Canvas format.",
      },
      {
        title: "nerdy.dev",
        href: "https://nerdy.dev/",
        dateAdded: "2026-07-23",
        description:
          "Personal site of Adam Argyle (argyleink), CSS specialist, conference speaker and co-host of the Whiskey Web and Whatnot podcast. Around 457 posts, heavily weighted toward CSS (283 posts) plus notes, talks, podcast episodes and a notebook of interactive demos like color pickers and scroll interactions. Recent writing covers new CSS features such as flex-wrap: balance and relative alpha, and a CSS Day 2026 talk titled Contextualism. The site itself runs on Fresh 2 with Deno KV for social data.",
      },
      {
        title: "Thomas Ankcorn",
        href: "https://ankcorn.dev/",
        dateAdded: "2026-07-22",
        description:
          "Personal blog of Thomas Ankcorn, an engineer on the Workers Observability team at Cloudflare, worth reading for infrastructure and performance writing grounded in production work. A small, high-signal set of posts: 'My Cloud Exit (Raspberry Pi Edition)' (Jan 2026), 'Vertical Integration Wins' (Jan 2025), 'ClickHouse's JSON: 6.5x Faster' (Dec 2024), and an older piece on secrets management with LaconiaJS (Jun 2020).",
      },
      {
        title: "Tim Smart",
        href: "https://timsmart.co/",
        dateAdded: "2026-07-20",
        description:
          "Personal site of Tim Smart (tim-smart), a founding engineer at Effect and one of the most prolific authors in that ecosystem. Worth following for what he ships rather than what he writes: effect-atom (formerly effect-rx), effect-http, and effect-mcp, an MCP server that pulls the Effect reference docs into your editor. Also writes release posts on effect.website covering @effect/cluster, the HashRing module and Effect.fn.",
      },
      {
        title: "Lucas Barake",
        href: "https://lucasbarake.com/",
        dateAdded: "2026-07-20",
        description:
          "Personal site of Lucas Barake, a software engineer who teaches Effect and TypeScript across a blog, a YouTube channel and Udemy courses. Posts and videos work through concrete problems rather than concepts: Effect Schema over the browser's IndexedDB, RBAC and ABAC permission modelling in TypeScript, and the difference between Effect.Service, Effect.Tag and Context.Tag. Useful when the official Effect docs leave you unsure which construct to reach for.",
      },
      {
        title: "Sunil Pai",
        href: "https://sunilpai.dev/",
        dateAdded: "2026-07-20",
        description:
          "Personal site of Sunil Pai (@threepointone), a systems engineer in London who has worked on React, Cloudflare Workers and PartyKit and now builds durable infrastructure for AI agents. The writing sits between infrastructure detail and essay: 'never waste a token' (June 2026) on resumable streams and crash recovery for LLM requests, 'the context is the work' (January 2026) on remote teams and coding agents, 'developer relations after the cheat code machine' on building judgment around AI systems. Read it for perspective on where agent tooling is heading, not for reference material.",
      },
      {
        title: "Joel on Software",
        href: "https://www.joelonsoftware.com/",
        dateAdded: "2026-07-14",
        description:
          "Joel Spolsky's legendary software engineering blog (Fog Creek/Trello/Stack Overflow co-founder), essays like 'The Joel Test' and 'Leaky Abstractions' that shaped a generation of engineering management thinking. Running continuously since 2000, making it one of the longest-lived software blogs still updated, with 'The Joel Test' a 12-question yes/no checklist.",
      },
      {
        title: "Making Software",
        href: "https://www.makingsoftware.com/",
        dateAdded: "2026-07-14",
        description:
          "Site/blog exploring how software actually gets made, the craft and process behind building it. Written and illustrated by Dan Hollick as an early-access reference manual releasing chapter by chapter on how touchscreens, blur, and bezier curves actually work.",
      },
      {
        title: "Effective Software",
        href: "https://www.effective.software/",
        dateAdded: "2026-07-14",
        description:
          "Site publishing essays and courses on writing effective, maintainable software. Run by Hemanta Kumar Sundaray, it centers specifically on Effect.TS with a paid 'Go Pro' tier alongside its free essays.",
      },
      {
        title: "I Hate Reading",
        href: "https://ihatereading.in/",
        dateAdded: "2026-07-14",
        description:
          "Developer blog distilling technical topics into short, digestible reads for people who'd rather skim than study a whole book. Posts are tagged with exact read times (2-5 min) and lean toward practical explainers on npm packages, AI tools, and JS internals over theory.",
      },
      {
        title: "Evan Bacon",
        href: "https://evanbacon.dev/",
        dateAdded: "2026-07-14",
        description:
          "Blog of Evan Bacon, a core Expo/React Native engineer, writing about React Native internals, Expo Router and the mobile web platform. Bacon literally built Expo Router himself, and as a teenage design technologist built life-sized Lego sculptures for SiriusXM's in-car experience project.",
      },
      {
        title: "TK",
        href: "https://www.iamtk.co/",
        dateAdded: "2026-07-14",
        description:
          "Site of TK Kinoshita, a software engineer and researcher writing on mathematics, machine learning and software engineering, with deep technical pieces on deep learning, web performance and programming language theory. Mentions landing 4 salary raises in 2 years at QuintoAndar as an engineer, alongside deep dives on building neural networks and TypeScript compilers from scratch.",
      },
      {
        title: "Jacob Paris",
        href: "https://www.jacobparis.com/content",
        dateAdded: "2026-07-14",
        description:
          "Blog of web developer Jacob Paris, tutorials and guides on React, Remix and TypeScript for building performant full-stack apps. Runs 150+ posts stretching back to 2020, concentrated specifically on Remix patterns like form validation, pagination, and Drizzle/Prisma/SQLite integration.",
      },
      {
        title: "Marvin Hagemeister",
        href: "https://marvinh.dev/",
        dateAdded: "2026-07-14",
        description:
          "Blog of Marvin Hagemeister, a core contributor to Preact (the 3kB React alternative used at Shopify and others), writing on JS tooling and frontend performance. Won a Google Open Source Peer Bonus in 2019 and writes a 'Speeding up the JavaScript ecosystem' series covering oxlint, Rust plugins, and JSX optimization.",
      },
      {
        title: "mcyoung",
        href: "https://mcyoung.xyz/",
        dateAdded: "2026-07-14",
        description:
          "Blog covering low-level systems topics: compilers, language design and the kind of deep technical writing that goes past the surface of how languages actually work. Written by Miguel Young de la Sota, a Rust toolchain engineer at Google, known for exhaustive single-topic deep dives rather than survey-style posts.",
      },
      {
        title: "Chris Lattner",
        href: "https://nondot.org/sabre/",
        dateAdded: "2026-07-14",
        description:
          "Personal site of Chris Lattner, creator of LLVM, Clang, Swift and Mojo, one of the most influential compiler engineers working today. Lattner started Swift in July 2010 and, after stints at Google and SiFive, co-founded Modular AI in 2022 to build MLIR-based ML infrastructure.",
      },
      {
        title: "Jordan Scales",
        href: "https://notes.jordanscales.com/",
        dateAdded: "2026-07-14",
        description:
          "Personal notes site with posts spanning programming concepts, career reflections and creative projects, drawn from notes the author keeps in Notion. He's the creator of 98.css, a CSS library that recreates the Windows 98 GUI, alongside experimental projects like hashart and Away Messages.",
      },
      {
        title: "pixperk",
        href: "https://www.pixperk.tech/blog",
        dateAdded: "2026-07-14",
        description:
          "Blog focused on deep technical explanations of backend systems: distributed databases, storage optimization, concurrency and system design, explained in plain language for practitioners. Written by Yashaswi Mishra, who built the vector database Kova and breaks down real systems like Google's GFS and Facebook's caching layer.",
      },
      {
        title: "Zoltan Kochan",
        href: "https://www.kochan.io/",
        dateAdded: "2026-07-14",
        description:
          "Blog of Zoltán Kochan, creator and lead maintainer of pnpm, writing about package management internals and JavaScript tooling. Kochan shipped pnpm's hook system in v1.12 (2017) and has written about its content-addressable store cutting installs to roughly a third of npm's time.",
      },
      {
        title: "Site Mini thoughts",
        href: "https://site-mini.vercel.app/thoughts",
        dateAdded: "2026-07-14",
        description:
          "Personal essay collection by Aiden Bai (creator of million.js/Million Lint), short pieces on research experiences and web dev technologies. Only two essays live, both dated 2022, including a piece on how Million.js compiles away Virtual DOM diffing overhead.",
      },
      {
        title: "Eli Rousso",
        href: "https://www.elirousso.com/",
        dateAdded: "2026-07-14",
        description:
          "Portfolio of Eli Rousso, a NYC-based product designer and developer offering one-week sprints, zero-to-one product builds, and ongoing design partnerships for founders. Client logos on the page include Shopify, Cash App, Square, and Faire, with the Sprint tier scoped to one problem in one week.",
      },
    ],
  },
  {
    title: "Developer profiles and socials",
    links: [
      {
        title: "Kalypso on Instagram",
        href: "https://www.instagram.com/kalypsodesigns/",
        dateAdded: "2026-08-12",
        kind: ["directory", "gallery"],
        stack: [
          "instagram",
          "open-source",
          "self-hosting",
          "typography",
          "fonts",
          "mockups",
          "design",
        ],
        useFor: [
          "designers to follow",
          "design instagram",
          "daily design inspiration",
          "free design resources",
          "open source design tools",
          "daily design carousel",
          "monospace fonts",
          "carousel design",
        ],
        description:
          "Instagram account of Kalypso, a product designer based in New Zealand, worth following for a daily carousel of free and open-source resources aimed at designers and developers. He has posted one carousel a day since Jan 1 2023, a streak pinned to the top of his grid as 'It took 3 years to create this post' covering Jan 1 2023 to Dec 31 2025, and the account sits at 2,198 posts and 419K followers. A 52-post sample runs to self-hosted developer tools, free and open-source monospace fonts, where to host a site for free in 2026, new open-source projects, rare free fonts, ascii tools, free app presentation mockups, UI components for developers, and design inspiration sites with MCP tools, with several of those recurring as an ongoing series rather than one-offs. It is all art-directed in near-black and signal red with heavy type; he is also building 72pt, a hand-picked catalogue of free open-source typefaces for iPhone and Mac, and states he does not do collaborations or promotions.",
      },
      {
        title: "Noah Elhadedy on Instagram",
        href: "https://www.instagram.com/noahelhadedy/",
        dateAdded: "2026-08-12",
        kind: "directory",
        stack: ["instagram", "ui", "ux", "ai", "design"],
        useFor: [
          "ui ux resources",
          "design resource lists",
          "designers to follow",
          "icon resources",
          "mockup resources",
          "free design tools",
          "ai design tools",
          "illustration packs",
        ],
        description:
          "Instagram account of Noah Elhadedy, a product designer working across B2B, B2C and SaaS, worth following for category-labelled carousel round-ups spanning design tooling and AI. A 48-post sample covers free premium mockups (running to Part 10), Mac apps, +150 icon resources, free fonts, illustration packs, SVG pattern websites, gradients and generators, wireframing and whiteboards, extensions every designer needs and Figma Config 2026, alongside a heavy AI seam: AI UI builder websites, AI branding websites, AI meeting note takers, prompt packs and trending agent skills. Covers carry a small category label at the top over a consistent near-black gradient with a byline chip, so the grid reads as one system rather than 133 separate posts. Worth knowing before you follow: the actual links are usually not in the post, he gates them behind commenting a keyword to trigger a DM, and the account sits at 8,904 followers posting close to daily; his portfolio is at noahelhadedy.com.",
      },
      {
        title: "Aristide Benoist on X",
        href: "https://x.com/AristideBenoist",
        dateAdded: "2026-08-05",
        kind: "portfolio",
        stack: ["webgl", "glsl", "javascript", "three"],
        useFor: [
          "creative developer",
          "webgl developer",
          "vanilla webgl",
          "interaction developer",
          "webgl without libraries",
          "motion and interaction",
          "creative dev to follow",
        ],
        description:
          "X account of Aristide Benoist, a French independent developer specialising in motion and interaction who works with agencies, startups and companies worldwide; his own site is at aristidebenoist.com. The reason to follow him is the build discipline rather than the visuals alone: his Portfolio 2021, which took Awwwards Site of the Day at 8.01 and then Site of the Month for June 2021 under the tags Experimental, Interaction Design, WebGL, GLSL and JavaScript, was written from scratch with no framework or library, bundled through a hand-rolled rollup, postcss and csso setup, and shipped at roughly 67 KB of JavaScript before gzip, with homepage imagery drawn through the WebGL API directly and content managed in flat JSON. Earlier iterations also took Site of the Day, including a 2017 Three.js build and a 2018 Swiss-styled portfolio, both designed by Ben Mingo, with Jon Way designing the 2021 one.",
      },
      {
        title: "CatsJuice",
        href: "https://oooo.so/",
        dateAdded: "2026-07-23",
        description:
          "Personal site of CatsJuice, a Node.js fullstack developer, and the hub behind Sticker Forge (sticker.oooo.so). The page itself is a deliberately minimal card: a one-line intro plus links out to GitHub, CodePen and X (@cats_juice). Follow through to the CodePen for their interaction experiments.",
      },
      {
        title: "Cassidoo",
        href: "https://github.com/cassidoo",
        dateAdded: "2026-07-14",
        description:
          "GitHub of Cassidy Williams, a well-known developer educator and newsletter writer (previously at Netlify and GitHub) with a large following for practical, funny dev content. Her pinned 'getting-a-gig' repo alone carries 7.7k stars, backing a profile with 14.9k followers and 191 repos.",
      },
      {
        title: "mrncstt",
        href: "https://github.com/mrncstt",
        dateAdded: "2026-07-14",
        description:
          "GitHub of Mariana Costa, a data engineer specializing in PySpark, Databricks and cloud infrastructure, sharing data-literacy learning resources. Only 64 followers; her top pinned repo is actually a personal French-learning notes collection, not a data-engineering project.",
      },
      {
        title: "cosmeratech",
        href: "https://github.com/cosmeratech",
        dateAdded: "2026-07-14",
        description:
          "GitHub of a self-taught developer and AI researcher from India focused on C++ and Python machine learning work. Real name Janvi, with a pinned py-QR (Python QR generator/scanner) repo and 39 total repos but just 20 followers.",
      },
      {
        title: "Abhi on X",
        href: "https://x.com/abh1a0/status/1993033150323392720",
        dateAdded: "2026-07-14",
        description:
          "A specific X (Twitter) post from developer Abhi worth referencing. It's a single tweet, not a thread or repo, so treat it as a one-off pointer rather than an updated, ongoing resource.",
      },
      {
        title: "Srajan on X",
        href: "https://x.com/_Creation22/status/2027378310779752857",
        dateAdded: "2026-07-18",
        description:
          "Specific X post by Srajan (@_Creation22), retained as a focused design and technical reference. A stand-alone post from @_Creation22 rather than a blog or repo, best read once for its specific technique, not revisited for updates.",
      },
      {
        title: "iximiuz on X",
        href: "https://x.com/iximiuz",
        dateAdded: "2026-07-14",
        description:
          "X account of Ivan Velichko (iximiuz), a well-known educator on containers, Linux internals and how the container runtime stack actually works under the hood. Velichko also runs iximiuz Labs, giving free hands-on browser sandboxes for practicing containers and Kubernetes internals instead of just reading about them.",
      },
      {
        title: "Anthony Fu",
        href: "https://github.com/antfu",
        dateAdded: "2026-07-15",
        description:
          "GitHub of Anthony Fu, extremely prolific open-source maintainer behind Vitest, UnoCSS, Slidev, VueUse and much of the Vite plugin ecosystem. His profile shows 399 public repos and 153+ sponsors, with VueUse alone past 22k stars, proof of sustained multi-project maintenance, not a one-hit tool.",
      },
      {
        title: "Daniel Roe",
        href: "https://roe.dev",
        dateAdded: "2026-07-15",
        description:
          "Site of Daniel Roe, Nuxt core team member and maintainer of fontaine, beasties, magic-regexp and page-speed.dev. Beasties is his fork of Google's abandoned Critters project, meaning he picked up critical-CSS inlining tooling nobody else was willing to maintain.",
      },
      {
        title: "Aiden Bai on X: CN search",
        href: "https://x.com/search?q=from%3Aaidenybai%20cn&src=typed_query",
        dateAdded: "2026-07-18",
        description:
          "Saved X search for posts by Aiden Bai matching “cn”, useful for revisiting that focused thread of his work and commentary. Aiden Bai created million.js, a drop-in React optimization library, and helped popularize the now-ubiquitous `cn()` classname-merging utility.",
      },
      {
        title: "Sebastien Chopin",
        href: "https://atinux.com",
        dateAdded: "2026-07-15",
        description:
          "Site of Sebastien Chopin (atinux), co-creator of Nuxt.js. Chopin now works at Vercel after years running NuxtLabs, having first shipped Nuxt.js back in 2016.",
      },
    ],
  },
  {
    title: "Engineering essays and culture",
    links: [
      {
        title: "X Engineering Blog",
        href: "https://blog.x.com/engineering/en_us",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["infrastructure", "hadoop", "scale"],
        useFor: [
          "twitter engineering",
          "twitter architecture",
          "hadoop at scale",
          "twitter infrastructure",
          "scaling a social network",
          "blobstore",
        ],
        description:
          "X's engineering blog, and in practice an archive rather than a feed: the newest posts are dated February 2023 and all of them still carry Twitter branding. What is there is worth mining for large-scale infrastructure writing, sorted into Insights, Infrastructure and Open source, with tags for machine learning, Cortex, Hadoop, realtime, scale and optimization. Representative posts cover the Blobstore hardware lifecycle monitoring and reporting service, Kerberizing Hadoop clusters, scaling reads on the Twitter users database, the Sparrow work on data storage at scale, using rasdaemon for hardware reliability, and measuring the impact of network latency with CausalImpact. Read it as a frozen record of how Twitter ran its data platform, not as a source of current practice.",
      },
      {
        title: "Discord Blog",
        href: "https://discord.com/blog",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["infrastructure", "realtime", "databases"],
        useFor: [
          "discord engineering",
          "voice infrastructure",
          "scaling messages",
          "trillions of messages",
          "rule engine",
          "end to end encryption",
          "real time chat architecture",
          "edge voice",
        ],
        description:
          "Discord's company blog, where the engineering writing sits alongside patch notes and product news under an Engineering & Developers category instead of on a separate domain. The technical posts are the reason to keep it: How We Moved Discord Voice to the Edge, How Discord Indexes Trillions of Messages, Cost Attribution in Discord's API, Osprey on open sourcing their rule engine, and the rollout that made every voice and video call end-to-end encrypted. The other categories run Featured, Community, Discord HQ, How to Discord, Policy & Safety and Product & Features, so filter before browsing or you will be reading changelogs. Recent non-engineering entries include the Social SDK reaching general availability for mobile in version 1.10 and a mobile design post on squircles, styles and spacing.",
      },
      {
        title: "Stripe Engineering Blog",
        href: "https://stripe.dev/blog/topic/engineering",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["ruby", "typescript", "infrastructure", "agents", "testing"],
        useFor: [
          "stripe engineering",
          "ruby monorepo",
          "type checker for ruby",
          "sorbet",
          "coding agents in production",
          "selective test execution",
          "ledger design",
          "payments architecture",
          "zero downtime migration",
          "monorepo ci",
        ],
        description:
          "The Engineering topic filter on Stripe's developer blog, 23 posts out of 115, every one with named author bylines and a date. The recurring subject is very large codebases and the tooling built to survive them: Sorbet as a type checker for Ruby, migrating millions of lines to TypeScript, rubyfmt formatting a 25 million line codebase overnight, selective test execution to keep CI fast on a 50M-line Ruby monorepo, and Java language upgrades run as a service. The money-movement half is the other draw, with Ledger for tracking and validating money movement, document databases holding 99.999% uptime through zero-downtime data migrations, and how Stripe Credits was built. Recent posts lean infrastructure and AI: a from-scratch high-performance distributed proxy data plane (August 2026), a Knowledge AI Platform, graph search and state machines auto-remediating a global database fleet, and Minions, their one-shot end-to-end coding agents, in two parts.",
      },
      {
        title: "OpenAI Engineering",
        href: "https://openai.com/news/engineering/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["llm", "agents", "infrastructure"],
        useFor: [
          "openai engineering",
          "codex sandbox",
          "responses api",
          "agentic workflows websockets",
          "low latency voice ai",
          "scaling inference access",
          "ai training networking",
          "agent orchestration spec",
        ],
        description:
          "The Engineering tag in OpenAI's newsroom, described on the page as stories about the technology and builders at OpenAI, and deliberately separate from the research and product announcements beside it. The posts are systems writing rather than model releases: Core dump epidemiology on fixing an 18-year-old bug, building a safe and effective sandbox to enable Codex on Windows, supercomputer networking to accelerate large scale AI training, and how OpenAI delivers low-latency voice AI at scale. The agent-facing entries are the most reusable, covering Symphony as an open-source spec for orchestration, speeding up agentic workflows with WebSockets in the Responses API, equipping that API with a computer environment, and going beyond rate limits to scale access to Codex and Sora. Newsroom filters sitting alongside it are Company, Research, Product, Safety, Security, Global Affairs, AI Adoption and Applied AI.",
      },
      {
        title: "Slack Engineering",
        href: "https://slack.engineering/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["infrastructure", "aws", "agents", "testing", "observability"],
        useFor: [
          "slack engineering",
          "ec2 platform",
          "agentic testing",
          "e2e testing with agents",
          "context management agents",
          "multi cloud ai",
          "notifications architecture",
          "accessibility vpat",
          "http3 readiness",
        ],
        description:
          "Slack's engineering blog, under the line 'Hear directly from Slack's engineers about what we build, why and how we build it', running 33 pages of archives with a read-time estimate on every post. Recent writing splits between infrastructure and agents: Shipyard, their next-generation EC2 platform (July 2026, 15 min), Slack AI's path to multi-cloud, a security-driven move of EMR data pipelines from SSH to REST, and scalable network probing plus HTTP/3 readiness with Prometheus. The agent posts are unusually concrete about where agents actually belong, covering agentic testing in the E2E stack, managing context in long-run agentic applications, and streamlining security investigations with agents. Also good on subjects most company blogs skip, including rebuilding notifications and an Android VPAT accessibility journey. Now a Salesforce company, with a separate developer blog linked from the nav.",
      },
      {
        title: "Spotify Engineering",
        href: "https://engineering.atspotify.com/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["backstage", "llm", "agents", "data", "developer-experience"],
        useFor: [
          "spotify engineering",
          "backstage",
          "developer experience at scale",
          "llm evals",
          "ab test with llms",
          "data lake indexing",
          "multi agent architecture",
          "foss fund",
          "coding agents migrations",
          "mobile release process",
        ],
        description:
          "Spotify's engineering blog, categorised across Data Science, Infrastructure, Platform, Developer Experience, Backstage, Machine Learning, Mobile, Open Source and People. The recent run leans hard on LLMs and agents as production practice rather than demos: when LLMs can replace humans in A/B tests, better experiments with LLM evals framed as a funnel not a fork, a multi-agent architecture for advertising, the context layer behind their data assistant, and background coding agents driving downstream dataset migrations. 'Coding Is No Longer the Constraint' is the one to read on scaling developer experience to teams and agents at the same time. The infrastructure side covers indexing the data lake for online point queries and a published content ingestion and podcast video incident report, while the open source thread runs through Backstage and the FOSS Fund, established in 2022 to support the open source projects Spotify depends on.",
      },
      {
        title: "r/RedditEng",
        href: "https://www.reddit.com/r/RedditEng/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: ["android", "infrastructure", "observability", "agents"],
        useFor: [
          "reddit engineering",
          "android localization",
          "http3 on android",
          "fault injection",
          "removing envoy",
          "zero trust",
          "prometheus metrics",
          "agentic development at scale",
          "incident reviews",
          "android video player",
        ],
        description:
          "Reddit's engineering blog, run as a subreddit instead of a marketing site, so every post carries a comment thread under it. Founded on 15 April 2021 by Lisa, then Chief of Staff to Reddit's founding engineer and CTO Chris Slowe, now its first Technical Fellow, along with a handful of colleagues, and it has published something every single week since. The recent series are genuinely deep: Scaling Android Localization in two parts, Reddit's Journey to HTTP/3 on Android in two parts, Snoocode on their approach to agentic development, Breaking Reddit on Purpose covering fault injection in Baseplate, From Proxy to Proxyless on removing Envoy from the feed serving path, and The Zero Trust Odyssey. A farewell post on 27 August 2026 marks the founder leaving the company and is explicit that the sub carries on without them, closing with one last cat tax, the running tradition of posting the cats who helped with the work.",
      },
      {
        title: "Figma Engineering Blog",
        href: "https://www.figma.com/blog/engineering/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: [
          "canvas",
          "webgpu",
          "rust",
          "postgres",
          "performance",
          "agents",
        ],
        useFor: [
          "figma engineering",
          "canvas rendering",
          "webgpu rendering",
          "postgres sharding",
          "canvas accessibility",
          "layers panel performance",
          "code connect mcp",
          "rust memory optimization",
          "c++ build times",
          "browser app performance",
        ],
        description:
          "The Engineering tag on Figma's blog, 136 posts, organised into What's new, How we built it, How we think, Speed at scale, Core infrastructure and Secure by design. It is the best public source on building a performance-critical canvas app in the browser, with posts on rendering Figma with WebGPU, Rust memory optimizations, C++ build times, incremental frame loading, dynamic page loading, improving performance in the layers panel, and building accessibility into a canvas-based product. The database and infrastructure thread is just as concrete: sharding Postgres, PGKeeper as the connection bouncer they needed for Postgres, a next-generation data caching platform, LiveGraph, and a Kubernetes migration. Recent posts are agent-heavy, covering Code Connect in MCP for better code with fewer tokens, securing internal systems with agents, staying ahead of vulnerabilities with agents, and measuring time savings from Figma Make.",
      },
      {
        title: "Netflix TechBlog",
        href: "https://netflixtechblog.com/",
        dateAdded: "2026-08-29",
        kind: "essay",
        stack: [
          "distributed-systems",
          "flink",
          "llm",
          "kubernetes",
          "recommendation",
        ],
        useFor: [
          "netflix engineering",
          "flink autoscaling",
          "distributed graph",
          "llm serving",
          "recommendation systems",
          "service topology",
          "kubernetes batch compute",
          "stream processing at scale",
          "personalization at scale",
        ],
        description:
          "Netflix's engineering blog, hosted on Medium, covering engineering, company culture and product development. The recent run splits between recommendation and LLM work and hard distributed systems: MAPS for multimodal asset personalization at scale, GenRec toward LLM-native recommendation, GenPage for end-to-end generative homepage construction, and in-house LLM serving. On the systems side there is A Tale of Two Flink Autoscalers, a three-part series on building a real-time distributed graph and querying it over gRPC, building service topology at scale, and simplifying batch compute with Kueue. Posts are long and carry full author lists; the RSS feed at /feed is the reliable way to follow it, since the site itself sits behind Medium's bot protection.",
      },
      {
        title: "RFD 1: Requests for Discussion",
        href: "https://rfd.shared.oxide.computer/rfd/0001",
        dateAdded: "2026-08-19",
        kind: "essay",
        stack: ["process", "documentation"],
        useFor: [
          "design doc process",
          "rfc process",
          "write a design doc",
          "engineering decision record",
          "technical writing process",
          "adr",
        ],
        description:
          "Oxide Computer's meta document defining its own RFD process, by Jess Frazelle and Bryan Cantrill, and the one to copy if you want design docs a team actually writes. Six states carry a document from prediscussion through ideation, discussion, published and committed to abandoned, on the rule that anything already representing consensus belongs in published. Each RFD takes a branch named for its zero-padded number, a directory, and AsciiDoc metadata for authors, state, discussion link and labels; a bot fills in whichever half you forget, opening the PR if you set the state or setting the state if you open the PR. Scope is deliberately wide: company process, hardware and software architecture, customer-facing APIs, test design, and non-technical matters too. Descends from the IETF RFC tradition, quoting RFC 3 that the minimum length for a note is one sentence.",
      },
      {
        title: "AI is removing the middle class of software engineering",
        href: "https://blog.florianherrengt.com/ai-removing-middle-class-software-engineering.html",
        dateAdded: "2026-08-18",
        kind: "essay",
        useFor: [
          "ai generated tech debt",
          "engineering culture ai",
          "large pull requests",
          "ai code review",
          "junior vs senior engineers",
          "ai and hiring",
        ],
        description:
          "Florian Herrengt's argument, dated 11 August 2026, that coding assistants did not create bad engineers, they removed the speed limit on the damage weak engineering culture can do, so those projects now fail much faster and salaries push further apart at both ends. The framing is a Monday back from holiday in 2026: seven PRs waiting, the first at +24506 -3938 with an AI-written description, thirteen by the second coffee, and the engineer who built the feature admitting they will have to ask Claude where its data comes from. It pre-empts the standard replies (bad engineers always existed, just fix your process, more output means more productive, it is no different from a compiler) and settles on the debt metaphor: generating 20,000 lines in an afternoon is cheap, comprehension stays slow, and untangling one bad decision means five more land while you work. The sharpest line is that a 10x engineer may be stealing productivity from the people who are hardest to replace.",
      },
      {
        title: "Everything hackable will get hacked",
        href: "https://vercel.com/blog/everything-hackable-will-get-hacked",
        dateAdded: "2026-08-12",
        kind: "essay",
        stack: ["security", "llm", "agents", "deepsec"],
        useFor: [
          "ai security review",
          "find vulnerabilities with ai",
          "codebase security audit",
          "scan for vulnerabilities",
          "sandbox escape",
          "offensive security models",
          "deepsec",
          "security posture",
        ],
        description:
          "Vercel CTO Malte Ubl's argument that models have gotten good enough at cybersecurity that defenders should run codebase-scale AI review now instead of waiting for the next release, published August 11, 2026. The threat side is concrete: Kimi K3, a near-frontier open-weight model with no cybersecurity safeguards, leads open-weight models on DeepSec Bench, and when pointed at Vercel Sandbox it mapped the guest-kernel attack surface, found the seccomp filter only blocks socket(AF_VSOCK), built a VM to reproduce its ideas and wrote a fuzzer, stopping short of an escape. The defensive half is deepsec (deepsec.sh), the open-source harness behind it, run with npx deepsec init and self-hostable on your own inference providers, best today at finding IDORs, XSS and SSRF. Vercel runs full reviews on mission-critical repos quarterly and whenever a stronger model ships, at tens of thousands of dollars a pass, and is extending its Sandbox egress firewall to the Hobby plan alongside a planned HackerOne program.",
      },
      {
        title: "Fast",
        href: "https://patrickcollison.com/fast",
        dateAdded: "2026-08-05",
        kind: "essay",
        useFor: [
          "build things fast",
          "shipping speed",
          "why projects take so long",
          "historical build times",
          "moving fast",
          "why we cannot build things anymore",
          "infrastructure delays",
        ],
        description:
          "Patrick Collison's running list of people quickly accomplishing ambitious things together, roughly 24 entries, each with a cited source. Brendan Eich prototyped JavaScript in 10 days, Torvalds had Git self-hosting in 4 and shipped it in 17, Ken Thompson wrote the first Unix in three weeks, Amazon Prime went from idea to announcement in about six weeks, and Kelly Johnson's team delivered the P-80 jet fighter in 143 days; the longer builds run from the Empire State Building at 410 days to the Pentagon at 491, the Eiffel Tower at 793 and the Boeing 747 at about 930. The counterweights are the point: San Francisco's Van Ness bus lane took roughly 7,600 days and $346 million, about $110,000 per meter, against $793 per meter for the 1,700 mile Alaska Highway built in 234 days. A closing 'What's going on?' section observes the physical feats cluster before 1970 and links to explanations from Marc Dunkelman, Alon Levy, Philip Howard, Mancur Olson and Fukuyama's notion of vetocracy. Collison takes submissions by email, so the list keeps growing.",
      },
      {
        title: "Honk",
        href: "https://benji.org/honkish",
        dateAdded: "2026-07-30",
        description:
          'Retrospective on Honk, a real-time messaging app built around live character-by-character typing, no send button, no chat history, and interactive mini-games (Trivia, Tic-Tac-Toe, True/False, Four-in-a-Row, Rock-Paper-Scissors) layered into the chat itself. Built by a twelve-person team including Alex Vanderzon, Miles Vinson, Chris Lang, and Benjamin Mayo, with custom typefaces (Honk Sans, Honk Chat) and sound design by Ethan Mueller; at its peak the app logged 2.6 billion characters typed and 170 million "Honks" (notifications) sent. Other features included presence indicators for partial attention, emoji battles with physics collisions, and customizable "Magic Words" emoji triggers. The team pivoted to build Family (family.co), which later acquired the Honk IP; the product is sunset.',
      },
      {
        title: "Claude Is Not a Compiler",
        href: "https://blog.exe.dev/claude-is-not-a-compiler",
        dateAdded: "2026-07-22",
        description:
          "Essay by Josh Bleecher Snyder on the exe.dev blog arguing that Claude is not a compiler translating specs into code, but a vertically integrated resource that works across vision, strategy, architecture and implementation at once. Grounds the claim in building a geographically distributed DNS server for exe.dev VMs in a week: agents researched alternatives, generated competing implementations, and surfaced design divergences like a timeline field for database rollbacks. Uses the Empire State Building (metalworkers involved in design decisions) as the analogy for why working across layers beats layered handoffs, and closes with 'vibe-engineering is just engineering'. Published July 2026.",
      },
      {
        title: "Three ways to solve problems",
        href: "https://andreasfragner.com/writing/three-ways-to-solve-problems",
        dateAdded: "2026-07-14",
        description:
          "Argues every problem has three possible responses: push toward the outcome you want, reinterpret the situation, or change what you want, and that the latter two are underused, especially in resource-constrained environments like startups. Leans on Gerald Weinberg's definition of a problem and an 80/20 cost-benefit lens for deciding which 10% of issues actually deserve solving.",
      },
      {
        title: "The campfire no agent can replicate",
        href: "https://connect.mux.com/the-campfire-no-agent-can-replicate",
        dateAdded: "2026-07-14",
        description:
          "Argues that despite AI automating more of the work itself, in-person developer gatherings remain irreplaceable, the spontaneous conversation and community that only happens when people actually show up together. Written by Dave from Mux, recounting hosting the company's first developer meetup at its SF office and a 5th straight year sponsoring React Miami.",
      },
      {
        title: "Dark Matter Developers",
        href: "https://www.hanselman.com/blog/dark-matter-developers-the-unseen-99",
        dateAdded: "2026-07-14",
        description:
          "Scott Hanselman's well-known essay on 'dark matter developers', the vast majority who never blog, tweet or speak at conferences, and why the loud minority isn't representative of the field. Published in 2012, this post coined the term itself, borrowing 'dark matter' from astrophysics to name programmers who leave no public trace.",
      },
      {
        title: "Building another blog engine",
        href: "https://jt.lol/posts/building-another-blog-engine",
        dateAdded: "2026-07-14",
        description:
          'Jamie Turner\'s writeup on building a blog engine with Convex and TanStack, generating the UI with v0, wiring the backend with Cursor, and building a markdown editor for drafting posts. Turner admits he "wrote very little of the code" himself, mostly coaching v0 and Cursor, including a 1000ms debounce on draft autosaves.',
      },
      {
        title: "The end of productivity theater",
        href: "https://muratbuffalo.blogspot.com/2026/02/end-of-productivity-theater.html",
        dateAdded: "2026-07-14",
        description:
          "Murat Demirbas's essay on 'productivity theater', looking busy versus actually shipping, and how AI tooling is exposing the difference more starkly. Frames it via Amdahl's Law, speeding up side habits is futile if the core task stays the bottleneck, after 15+ years running his life on Emacs org-mode.",
      },
      {
        title: "How to be 10x more productive",
        href: "https://newsletter.techworld-with-milan.com/p/how-to-be-10x-more-productive",
        dateAdded: "2026-07-14",
        description:
          "Newsletter piece on practical habits and systems for meaningfully increasing engineering output, not just working longer hours. Cites the Ivy Lee method (pick just 5-6 ranked tasks daily) and notes flow states need 20-30 minutes to kick in, capping deep work near 3-4 hours.",
      },
      {
        title: "The making of a JPEG",
        href: "https://www.sophielwang.com/blog/jpeg",
        dateAdded: "2026-07-14",
        description:
          "Explainer on how JPEG compression actually works: color space conversion, discrete cosine transform and quantization, the pipeline that turns a photo into a small file. Walks through why JPEG splits images into 8x8 pixel blocks for the DCT and converts RGB to YCbCr first, since eyes notice brightness far more than color.",
      },
      {
        title: "How Margaret Hamilton landed NASA on the moon",
        href: "https://allthatsinteresting.com/margaret-hamilton",
        dateAdded: "2026-07-14",
        description:
          "The well-known story of Margaret Hamilton, who led the software team for the Apollo program's guidance computer and whose error-handling code saved the Apollo 11 landing. Hamilton coined the term 'software engineering' itself and received the Presidential Medal of Freedom in 2016 for her Apollo guidance-code work.",
      },
      {
        title: "Bytes newsletter",
        href: "https://bytes.dev",
        dateAdded: "2026-07-14",
        description:
          "Twice-weekly JavaScript news newsletter from the Syntax.fm crew, summarizing what happened in the JS ecosystem with a conversational, funny tone. Each free issue ends with a developer job board and a lighthearted JS trivia question readers can reply to answer.",
      },
      {
        title: "The Turbopack vision",
        href: "https://vercel.com/blog/the-turbopack-vision",
        dateAdded: "2026-07-15",
        description:
          "Architecture and rationale piece on Turbopack, the Rust bundler built to replace webpack, Babel and Terser in the Next.js toolchain. Built in Rust by webpack creator Tobias Koppers, targeting hot reloads in milliseconds regardless of codebase size.",
      },
      {
        title: "Building an MCP server for Nuxt",
        href: "https://nuxt.com/blog/building-nuxt-mcp",
        dateAdded: "2026-07-15",
        description:
          "Nuxt team's technical writeup on exposing Nuxt's docs to AI assistants via a structured MCP server with composable tools. Auto-registers any tool file dropped into server/mcp/ and serves it over HTTP at /mcp, with per-tool response caching like cache: '1h'.",
      },
      {
        title: "Introducing the Nuxt Agent",
        href: "https://nuxt.com/blog/introducing-nuxt-agent",
        dateAdded: "2026-07-15",
        description:
          "Nuxt team's post on Nuxi, an in-docs AI assistant grounded in official documentation, built with the AI SDK and Nuxt UI components. Runs claude-sonnet-4.6 via AI SDK v6 streamText, capped at 20 messages per day per IP and 10 tool-call steps.",
      },
      {
        title: "New performance panel in React Native 0.83",
        href: "https://swmansion.com/blog/react-native-debugging-new-performance-panel-in-react-native-0-83-21ca90871f6d/",
        dateAdded: "2026-07-15",
        description:
          "Software Mansion post detailing the in-app performance-trace recording panel they built into React Native DevTools for measuring runtime performance without Flipper. Splits each re-render into five phases (Update, Render, Commit, Waiting for paint, Remaining Effects) in a color-coded flamegraph.",
      },
      {
        title: "Out with the old, in with the New Architecture",
        href: "https://expo.dev/blog/out-with-the-old-in-with-the-new-architecture",
        dateAdded: "2026-07-15",
        description:
          "Expo engineering post on the SDK 53 default-on switch to Fabric, TurboModules and JSI replacing the legacy bridge, plus the interop layer keeping old-architecture libraries working unmodified. As of April 2025, 74.6% of SDK 52 projects on EAS Build had already adopted New Architecture before SDK 53 made it the default.",
      },
    ],
  },
  {
    title: "YouTube channels",
    links: [
      {
        title: "CodeTV",
        href: "https://www.youtube.com/@codetv-dev/videos",
        dateAdded: "2026-07-14",
        description:
          "Developer-focused video channel/network (from the founders of egghead.io) publishing interviews, talks and shows about the craft and culture of software engineering. Home of Learn With Jason, a flagship live-coding interview series hosted by Jason Lengstorf that runs across multiple seasons on the network.",
      },
      {
        title: "Deep Learning with Yacine",
        href: "https://www.youtube.com/@deeplearningexplained",
        dateAdded: "2026-07-14",
        description:
          "YouTube channel explaining deep learning and AI concepts in an accessible way. Run by Montreal-based Yacine Mahdid, who posts weekly hands-on project videos plus live paper-review streams for a pragmatic, build-it audience.",
      },
      {
        title: "Developer Voices",
        href: "https://www.youtube.com/@DeveloperVoices",
        dateAdded: "2026-07-14",
        description:
          "Kris Jenkins's long-form interview podcast/channel talking to engineers about programming languages, databases and systems, known for going deep rather than staying surface-level. Kris Jenkins runs this independently alongside his day job as a Confluent developer advocate hosting the Kafka-focused Streaming Audio podcast.",
      },
      {
        title: "Learn That Stack",
        href: "https://www.youtube.com/@LearnThatStack",
        dateAdded: "2026-07-14",
        description:
          "YouTube channel teaching specific tech stacks end to end, tutorial-style walkthroughs of building real projects. Angled specifically at interview prep: cheat sheets, mock-interview walkthroughs and system-design questions rather than general project tutorials.",
      },
      {
        title: "Performance Observer",
        href: "https://www.youtube.com/@PerformanceObserver/videos",
        dateAdded: "2026-07-14",
        description:
          "YouTube channel focused on web performance: profiling, Core Web Vitals and optimization techniques. Hosted by Google Chrome DevTools engineer Adam Argyle-adjacent creators; episodes run as long-form interviews with actual browser engineers, not just tips videos.",
      },
      {
        title: "Lydia Hallie",
        href: "https://www.youtube.com/@theavocoder",
        dateAdded: "2026-07-14",
        description:
          "Channel of Lydia Hallie ('theavocoder'), known for beautifully animated deep-dive explainers on JavaScript internals, Git and how dev tools actually work under the hood. Hallie is a software engineer who has worked at Vercel, and her animated Git internals video alone has racked up millions of views.",
      },
      {
        title: "Handmade Network podcast",
        href: "https://handmade.network/podcast",
        dateAdded: "2026-07-14",
        description:
          "Podcast from the Handmade Network, a community focused on building software from scratch with a deep understanding of the underlying systems, rather than stacking abstractions. Hosted by Ryan Fleury (creator of RAD Debugger), with guests like Ginger Bill (Odin language) and Ramon Santamaria (Raylib) across 18+ episodes.",
      },
      {
        title: "John Hammond",
        href: "https://www.youtube.com/@_JohnHammond",
        dateAdded: "2026-07-14",
        description:
          "Well-known cybersecurity YouTuber covering CTF walkthroughs, malware analysis and offensive security techniques. A former high-school teacher turned full-time security researcher at Huntress, posting near-daily videos since 2017 with over 1,000 uploads.",
      },
      {
        title: "Andrej Karpathy",
        href: "https://www.youtube.com/@AndrejKarpathy",
        dateAdded: "2026-07-14",
        description:
          "Channel of Andrej Karpathy (former Tesla AI director, OpenAI founding member), known for exceptionally clear, from-scratch explanations of neural networks and LLMs, including the 'zero to hero' series. His 'Let's build GPT from scratch' video walks through ~120 lines of Python implementing a transformer with no ML library abstractions.",
      },
      {
        title: "Yannic Kilcher",
        href: "https://www.youtube.com/@YannicKilcher",
        dateAdded: "2026-07-14",
        description:
          "Channel dedicated to detailed, critical paper-review breakdowns of new machine learning research as it's published. Run by Yannic Kilcher, who holds a PhD in machine learning from ETH Zurich and later co-founded the open-source OpenAssistant project.",
      },
      {
        title: "The Net Ninja",
        href: "https://www.youtube.com/@NetNinja",
        dateAdded: "2026-07-14",
        description:
          "Long-running, widely used channel of concise, practical web development tutorials across frameworks and tools. Hosted by UK developer Shaun Pelling, who structures nearly every topic as a free, dozens-of-episodes step-by-step playlist rather than single videos.",
      },
      {
        title: "Corey Schafer",
        href: "https://www.youtube.com/@coreyms",
        dateAdded: "2026-07-14",
        description:
          "Well-known channel of clear, thorough Python and general programming tutorials, a common recommendation for learning Python properly. Largely dormant since 2020, yet Corey's multi-hour Python OOP and Flask-from-scratch series still rank among the most-cited tutorials of that era.",
      },
      {
        title: "TechWorld with Nana",
        href: "https://www.youtube.com/@TechWorldwithNana",
        dateAdded: "2026-07-14",
        description:
          "One of the most popular DevOps and Kubernetes education channels, known for clear diagrams and practical, no-fluff explanations. Creator Nana Janashia, a former sysadmin turned DevOps engineer, also sells a paid end-to-end DevOps bootcamp beyond the free videos.",
      },
      {
        title: "Luke Barousse",
        href: "https://www.youtube.com/@LukeBarousse",
        dateAdded: "2026-07-14",
        description:
          "Channel focused on data analytics careers and skills, portfolio projects, job market insights and practical data tooling. Luke, a former data analyst, co-hosts the Data Career Podcast and built his channel around real job-postings scraping projects rather than abstract tutorials.",
      },
      {
        title: "Gaurav Sen",
        href: "https://www.youtube.com/@gkcs",
        dateAdded: "2026-07-14",
        description:
          "Well-known system design education channel, walking through how to design scalable systems for both interviews and real architecture. Hosted by a former Facebook and Directi software engineer who also co-founded the paid system-design course platform InterviewReady alongside the channel.",
      },
      {
        title: "Hussein Nasser",
        href: "https://www.youtube.com/@hnasr",
        dateAdded: "2026-07-14",
        description:
          "Prolific backend engineering channel covering databases, networking protocols and systems design in practical, code-adjacent detail. Runs near-daily unscripted livestreams under 'The Backend Engineering Show', separate from his scripted tutorials, plus self-published networking books.",
      },
      {
        title: "The Cherno",
        href: "https://www.youtube.com/@TheCherno",
        dateAdded: "2026-07-14",
        description:
          "Well-known C++ and game engine development channel, including the long-running Hazel game engine series built live on stream. Real name Yan Chernikov, an Australian developer whose live-built Hazel engine series has run continuously since 2019 across hundreds of episodes.",
      },
      {
        title: "Learn Linux TV",
        href: "https://www.youtube.com/@LearnLinuxTV",
        dateAdded: "2026-07-14",
        description:
          "Channel teaching Linux system administration, self-hosting and open-source tooling from the ground up. Run solo by Jay LaCroix since 2011, pairing tutorials with a members-only homelab community and hands-on Proxmox and TrueNAS build guides.",
      },
      {
        title: "David Bombal",
        href: "https://www.youtube.com/@davidbombal",
        dateAdded: "2026-07-14",
        description:
          "Well-known networking and cybersecurity channel, covering CCNA content, ethical hacking and interviews with security researchers. Hosted by a double-CCIE-certified engineer known for hardware-hacking demos with tools like the Flipper Zero and WiFi Pineapple.",
      },
      {
        title: "3Blue1Brown",
        href: "https://www.youtube.com/@3blue1brown",
        dateAdded: "2026-07-14",
        description:
          "Grant Sanderson's iconic math visualization channel, famous for making linear algebra, calculus and neural networks intuitive through animated explanation. Grant Sanderson also founded the Summer of Math Exposition (SoME), an annual contest that seeded a wave of new math-explainer YouTube channels.",
      },
    ],
  },
  {
    title: "Talks and individual videos",
    links: [
      {
        title: "Graph Engineering vs Loop Engineering (什么是图工程)",
        href: "https://www.youtube.com/watch?v=8RedSkw1UjE",
        dateAdded: "2026-08-18",
        kind: "video",
        stack: ["llm"],
        useFor: [
          "graph engineering",
          "loop engineering",
          "multi agent orchestration",
          "langgraph",
          "react agent loop",
          "workflow orchestration",
        ],
        description:
          "Mandarin-language explainer from the 最佳拍档 channel on the move from loop engineering to graph engineering: from orchestrating one agent's autonomous ReAct loop to arranging many agents, tools and people into a graph that can be observed, resumed and scaled. It lays out a five-layer view of how AI engineering got here, then works through the structural limits of the pure loop, goal blindness in particular, and where a graph earns its extra complexity, with LangGraph, prompt engineering and validator nodes as the running examples. Worth watching against LangChain's own position that graph engineering is not new, which is the other half of the argument.",
      },
      {
        title: "Performance Engineering at TigerBeetle",
        href: "https://youtu.be/-p-Xm7VEqSk",
        dateAdded: "2026-07-25",
        description:
          "Guest lecture at the Technical University of Munich, July 2026, on how the TigerBeetle team does performance engineering on their financial transactions database. Published on the TUM channel and picked up on the Ziggit Zig forum the same month; the video title does not name the speaker. Where the other TigerBeetle material in this registry covers design decisions (the 1000x interface talk, the four-fuzzers post), this one is about the day-to-day practice of measuring and tuning.",
      },
      {
        title: "AWS re:Invent",
        href: "https://www.youtube.com/playlist?list=PL2yQDdvlhXf_NqSnDKx7Hbb9FrNQKmxg7",
        dateAdded: "2026-07-14",
        description:
          "Playlist of official session recordings from AWS re:Invent, AWS's flagship annual conference. Held every year in Las Vegas since 2012, re:Invent draws tens of thousands of attendees and produces hundreds of these session recordings.",
      },
      {
        title: "The DevOps roadmap that got me hired",
        href: "https://youtu.be/8s0DWeHuEaw",
        dateAdded: "2026-07-14",
        description:
          "Video: 'The DevOps Roadmap That Got Me Hired (No CS Degree, No Certs)', a personal account of the path into a DevOps role without a traditional CS background. Pitches skipping certifications entirely, unusual since most DevOps roadmaps treat an AWS or CKA cert as the mandatory first step.",
      },
      {
        title: "The co-creator of Kubernetes",
        href: "https://youtu.be/FKijpCEH9D8",
        dateAdded: "2026-07-14",
        description:
          "Interview 'The Co-Creator of Kubernetes: Engineering-Led Direction and Convincing Management' with Brendan Burns, on how Kubernetes's technical direction actually got decided and sold internally at Google. Burns co-founded Kubernetes at Google in 2014 with Craig McLuckie and Joe Beda, then left for Microsoft in 2016 as a corporate VP.",
      },
      {
        title: "React for Two Computers, Dan Abramov",
        href: "https://youtu.be/ozI4V_29fj4",
        dateAdded: "2026-07-14",
        description:
          "Dan Abramov talk exploring how React's model changes when you think about it as coordinating two computers (server and client) instead of one, relevant to Server Components and modern React architecture. Delivered by Dan Abramov, co-creator of Redux and Create React App, now on the React core team explaining Server Components' mental model.",
      },
      {
        title: "Live streaming at world record scale",
        href: "https://youtu.be/qXJ3S3T3xJY",
        dateAdded: "2026-07-14",
        description:
          "Talk 'Live streaming at world-record scale' with Ashutosh Agrawal (ex-Jio/Disney+ Hotstar), on the infrastructure behind streaming live video to record-breaking concurrent audiences. Cites Hotstar's own Guinness World Record: 25.3 million concurrent viewers streaming the 2019 Cricket World Cup semifinal.",
      },
      {
        title: "The power of an interface for performance",
        href: "https://www.youtube.com/watch?v=yKgfk8lTQuE&t=2929s",
        dateAdded: "2026-07-14",
        description:
          "Talk '1000x: The Power of an Interface for Performance' by TigerBeetle's Joran Dirk Greef, on how the shape of an interface itself can unlock or block order-of-magnitude performance gains. Argues it's TigerBeetle's batched, single-call interface, not per-request RPC, that actually unlocks the 1000x named in the title.",
      },
    ],
  },
  {
    title: "Self-hosted software",
    links: [
      {
        title: "Replacements.fyi",
        href: "https://replacements.fyi",
        dateAdded: "2026-07-14",
        description:
          "Directory pairing popular paid SaaS products with open-source, self-hostable alternatives that do roughly the same job. A hand-curated, GitHub-submittable list rather than an auto-scraped directory, so each swap has been manually checked.",
      },
      {
        title: "Spacebar Chat",
        href: "https://github.com/spacebarchat",
        dateAdded: "2026-07-14",
        description:
          "Open-source, Discord-API-compatible chat client and server, for running your own Discord-like chat platform. Flagship client/server repo has 6,688 GitHub stars and is mostly TypeScript, with separate Go and C++ repos for WebRTC voice.",
      },
      {
        title: "Plunk",
        href: "https://www.useplunk.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source email platform positioned as an alternative to SendGrid, for sending transactional and marketing email from your own infrastructure. AGPL-3.0 licensed with 5,000+ GitHub stars, charging $0.001 per email versus SendGrid's roughly $0.002.",
      },
      {
        title: "OpenStatus registry",
        href: "https://www.openstatus.dev/registry",
        dateAdded: "2026-07-14",
        description:
          "Open-source registry of self-hosted status page projects, cataloging tools like the ones in this list's self-hosted-software group. Ships roughly 20 shadcn/ui pieces (3 collections, 9 body blocks, 7 chrome blocks) built for Tailwind v4, installed via one shadcn CLI command.",
      },
      {
        title: "Documenso",
        href: "https://documenso.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source alternative to DocuSign for collecting legally binding e-signatures on your own infrastructure. Covers 21 CFR Part 11, ESIGN Act, UETA, SOC2, and HIPAA compliance, letting regulated industries self-host without losing certification status.",
      },
      {
        title: "HeyForm",
        href: "https://github.com/heyform/heyform",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted form builder, a free alternative to Typeform. Drag-and-drop editor, conditional logic, and multiple question types, deployable via Docker. Licensed AGPL-3.0 with 8.9k GitHub stars, and supports custom CSS overrides for deeper visual personalization than most Typeform clones.",
      },
      {
        title: "Gotify",
        href: "https://github.com/gotify",
        dateAdded: "2026-07-14",
        description:
          "Simple self-hosted push notification server. Send messages to your phone or desktop over a lightweight REST API and WebSocket, without routing through a third-party service. Written in Go, the server repo alone carries over 15,000 GitHub stars and 841 forks, plus a dedicated Android client app.",
      },
      {
        title: "LimeSurvey",
        href: "https://github.com/LimeSurvey/LimeSurvey",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted survey tool with a long track record in academic and enterprise research, supporting complex branching logic, quotas and multilingual surveys. Running since 2006, its PHP/JS codebase spans 43,000+ commits and now ships 900+ ready-made survey templates across 80+ languages.",
      },
      {
        title: "Cachet",
        href: "https://github.com/cachethq/cachet",
        dateAdded: "2026-07-14",
        description:
          "Open-source status page system for reporting incidents and uptime to your users, self-hosted instead of paying for a hosted status page product. Built on Laravel/PHP with 15k+ GitHub stars, requires PHP 8.3+, and is mid-rebuild toward a major v3 release.",
      },
      {
        title: "Sessy (GitHub)",
        href: "https://github.com/marckohlbrugge/sessy",
        dateAdded: "2026-07-14",
        description:
          "Source code for Sessy, an open-source email observability platform that wraps Amazon SES to track sends, deliveries, bounces, opens and complaints without per-message fees. Built by Marc Köhlbrugge, the indie maker behind BetaList and WIP, as a Ruby on Rails app under the O'Saasy License.",
      },
      {
        title: "Sessy (app)",
        href: "https://sessy.do",
        dateAdded: "2026-07-14",
        description:
          "Hosted version of Sessy: a self-hosted-friendly dashboard giving visibility into Amazon SES email delivery, so you can monitor performance without an SES-wrapper subscription. Hosted version is free during its current beta, pitched against Postmark ($15-897/mo) and Resend ($20-350/mo) at equivalent send volumes.",
      },
      {
        title: "Whoogle Search",
        href: "https://github.com/benbusby/whoogle-search",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted, ad-free proxy for Google search results, stripping ads, JavaScript and tracking so you get Google's results without Google watching you search. Announced as reaching its final release in April 2026, since Google now aggressively blocks no-JS queries and workarounds ran out.",
      },
      {
        title: "Gitea",
        href: "https://about.gitea.com",
        dateAdded: "2026-07-14",
        description:
          "Lightweight, self-hosted Git service, a much smaller-footprint alternative to GitLab or a self-hosted GitHub, with issues, PRs, actions and packages built in. MIT-licensed and used in production by Google, Two Sigma, MediaTek and Mastercard, with 20+ package registry formats built in.",
      },
      {
        title: "Coolify",
        href: "https://coolify.io",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hostable alternative to Vercel or Heroku: point it at a VPS and it handles deploys, databases, SSL and previews for your apps. Ships 280+ one-click service templates and automatic PR-preview deployments, backed by a 20,000+ member community, per its own site.",
      },
      {
        title: "Slash",
        href: "https://github.com/yourselfhosted/slash",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted link organizer built around short, memorable shortcuts like s/roadmap that redirect to your frequently used URLs. Includes analytics, a browser extension, and team sharing; built with TypeScript and Go. AGPL-3.0 licensed with roughly 3.2k GitHub stars; latest release is v0.5.3, still a fairly small/young project.",
      },
      {
        title: "Docmost",
        href: "https://docmost.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted wiki and documentation tool, positioned as a Notion/Confluence alternative with real-time collaborative editing and permissions. Adds a self-hosted AI layer with semantic search and chat, and can run as an MCP server so tools like Claude query your wiki directly.",
      },
      {
        title: "Glance",
        href: "https://github.com/glanceapp/glance",
        dateAdded: "2026-07-14",
        description:
          "Lightweight, highly customizable self-hosted dashboard that aggregates RSS, Reddit, YouTube, weather and more into one streamlined feed. Built in Go, low memory footprint, works well on mobile. Ships as a single sub-20MB binary (AGPL-3.0, ~35.8k stars), with Docker/server-stats and market-price widgets alongside the usual feeds.",
      },
      {
        title: "Paymenter",
        href: "https://paymenter.org",
        dateAdded: "2026-07-14",
        description:
          "Open-source billing platform built specifically for hosting businesses: subscription management, invoicing and automated service provisioning, with pluggable payment gateways and no vendor lock-in. MIT-licensed with a built-in WHMCS migration importer plus native panel integrations for Pterodactyl, cPanel, Plesk, and Virtualizor.",
      },
      {
        title: "Windmill",
        href: "https://www.windmill.dev",
        dateAdded: "2026-07-14",
        description:
          "Code-first workflow orchestration platform for internal tools, apps and data pipelines. Write scripts in Python, TypeScript, Go, Bash or SQL, chain them into workflows, and it auto-generates a UI, all Git-backed. Y Combinator-backed and SOC 2 Type II certified, it's used by 4,000+ organizations including 300+ Enterprise Edition customers.",
      },
      {
        title: "FileFlows",
        href: "https://fileflows.com",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted automation platform for file processing pipelines: visually design workflows for video transcoding, audio processing and image optimization, scalable from a single box to a cluster. Taps GPU hardware encoders (NVIDIA NVENC, Intel QSV, AMD AMF, VAAPI, VideoToolbox) and also handles ebook (EPUB/MOBI) and comic (CBZ/CBR) formats.",
      },
      {
        title: "DocuSeal",
        href: "https://www.docuseal.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted alternative to DocuSign: build PDF forms, collect legally binding e-signatures, and keep the whole signing flow off a third-party server. Has 17k GitHub stars and is free forever for individual use, only charging once you need team or business features.",
      },
      {
        title: "Postiz",
        href: "https://postiz.com",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hosted social media scheduler: plan and publish posts across platforms from one dashboard instead of paying for Buffer or Hootsuite. Covers 30+ networks and ships a built-in AI agent you can chat with to draft, image, and schedule a post end-to-end in one request.",
      },
      {
        title: "Colanode",
        href: "https://colanode.com",
        dateAdded: "2026-07-14",
        description:
          "Local-first, open-source collaboration platform that bundles messaging, document editing, databases and file storage into one self-hostable app, syncing via conflict-free replication so you keep full data ownership. Has 4.3k GitHub stars and saves data to your device first before syncing in the background, so it keeps working offline.",
      },
      {
        title: "Mazanoke",
        href: "https://mazanoke.com",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted image compressor: a fast, simple, privacy-respecting alternative to uploading photos to a third-party compression site. Runs entirely client-side via WebAssembly, so even on a shared self-hosted instance your images are compressed in-browser and never actually reach the server.",
      },
      {
        title: "Cloudreve",
        href: "https://cloudreve.org",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted cloud storage system for standing up your own file-sharing platform, with configurable public or private deployment and support for multiple storage backends. Ships as a single Go binary yet can mount local disk, S3, OneDrive, Qiniu, and OSS as interchangeable storage backends at once, no separate services required.",
      },
      {
        title: "Karakeep",
        href: "https://karakeep.app",
        dateAdded: "2026-07-14",
        description:
          "Bookmark manager for links, notes, images and PDFs, with AI-generated tags, full-text search and automation rules. Available as a hosted service or a self-hosted, open-source deployment. Formerly called Hoarder before its rebrand, and now backed by 26k+ GitHub stars and 150+ contributors, one of the more actively maintained tools in this list.",
      },
      {
        title: "WriteFreely",
        href: "https://writefreely.org",
        dateAdded: "2026-07-14",
        description:
          "Minimalist, self-hosted blogging platform behind the write.as network, focused on plain, distraction-free writing rather than themes and plugins. Written in Go as a single dependency-free binary light enough for a Raspberry Pi, and has quietly powered over 550,000 blogs on the Write.as network.",
      },
      {
        title: "YOURLS",
        href: "https://yourls.org",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted URL shortener you run on your own domain, with click stats, a plugin architecture, and full control over your short links instead of trusting a third-party shortener. Built by Ozh (Ozh Richard) and MIT-licensed, with built-in click analytics that include visitor geo-location, not just raw hit counts.",
      },
      {
        title: "MediaCMS",
        href: "https://mediacms.io",
        dateAdded: "2026-07-14",
        description:
          "Self-hosted, open-source video and media platform, essentially a YouTube you run yourself, with transcoding, playlists, categories and user channels. Licensed AGPL-3.0 and backed by ~5,000 GitHub stars (mediacms-io/mediacms), built on Django and React under active corporate maintenance.",
      },
      {
        title: "pad.ws",
        href: "https://pad.ws",
        dateAdded: "2026-07-14",
        description:
          "Self-hostable infinite whiteboard built on top of Excalidraw, for sketching and collaborating on a canvas you control. Pairs the Excalidraw canvas with an embedded Linux desktop/terminal per board, so you can run real tools next to your sketches, not just draw.",
      },
      {
        title: "OpenCut",
        href: "https://opencut.app",
        dateAdded: "2026-07-14",
        description:
          "Open-source, self-hostable video editor built for the web, positioned as a free alternative to CapCut for cutting and assembling clips in the browser. MIT-licensed and has rocketed past 75,000 GitHub stars, making it one of the fastest-growing open-source video editors on GitHub.",
      },
    ],
  },
  {
    title: "Mockups, textures and patterns",
    links: [
      {
        title: "Book of Shapes",
        href: "https://bookofshapes.com/",
        dateAdded: "2026-09-02",
        kind: "asset",
        stack: ["svg"],
        useFor: [
          "svg patterns",
          "generative patterns",
          "background pattern",
          "seamless pattern",
          "customizable svg",
          "geometric pattern library",
          "isometric pattern",
          "noise pattern",
        ],
        description:
          "Collection of minimal, generative SVG patterns, each on its own page where you tune the parameters before taking the output. Nikolaj Sokolowski built it, and the catalogue is tagged by construction method rather than by look: grid (22), radial (18), noise (18), flow (17), isometric (13), organic (9), distortion (8) and physics (5). Individual patterns run from Flow Dots and Node Garden to Quarter Arc Truchet and Iso Cube Wireframe, sortable by recent, popular or liked, with a Collected page for saving favorites. No license or pricing appears anywhere on the site, so check before shipping one commercially.",
      },
      {
        title: "Backgrounds Supply",
        href: "https://backgrounds.supply",
        dateAdded: "2026-08-06",
        kind: "asset",
        useFor: [
          "gradient backgrounds",
          "background pack",
          "abstract backgrounds",
          "hero background image",
          "wallpaper pack",
          "animated backgrounds",
          "mesh gradient",
        ],
        description:
          "Paid vault of ready-made background images: handcrafted gradients plus AI-generated visuals, sold as themed packs to drop straight into a layout. Around 27 named collections are listed, among them Gradient BGs (165), Smudge (112), Perplex (104), Zephyr (83), Surrealis (82) and an Animated Backgrounds pack (36), though the counts on the page disagree with each other: the header claims 1,273 backgrounds across 29 collections while the FAQ says 1,167 across 24. Built by Kailash (@kail.designs) and sold through Lemon Squeezy for a single $49 payment with lifetime access and monthly drops included, no subscription and no refunds. The license covers client work, apps, ads and motion projects but not reselling the files as a standalone product. Formats and resolutions are never stated on the page.",
      },
      {
        title: "Lottielab animated mockups",
        href: "https://www.lottielab.com/templates/mockups",
        dateAdded: "2026-08-05",
        stack: ["lottie"],
        useFor: [
          "animated mockup",
          "lottie mockup",
          "phone mockup",
          "billboard mockup",
          "product mockup animation",
          "lottie templates",
        ],
        description:
          "Set of 18 free animated mockup templates in Lottie form, for putting a product on a phone, a billboard or a card without opening After Effects to build one from scratch. They cover floating and in-hand phone shots against dried flower, grey and black backgrounds, phone carousels in vertical, horizontal and radial arrangements, billboards at a metro station, an underpass and a roadside, plus a lanyard drop, a ticket rip and card CVV animations. Each opens in Lottielab, a browser-based Lottie editor whose surrounding tools include Figma to Lottie, SVG to Lottie, a dotLottie converter, a file size optimizer and exports to GIF, MP4 and WebM. The page sits under a Marketing grouping next to Logos, Showreels and Social media; no company or maker is named on the site beyond a hello@lottielab.com address.",
      },
      {
        title: "mckp",
        href: "https://mckp.live",
        dateAdded: "2026-07-29",
        description:
          "3D mockup tool by studio ls.graphics whose distinguishing move is embedding the mockup live rather than exporting a still: visitors can interact with the device on your portfolio or a client's homepage, or you can render it out as video. Over 300 scenes covering iPhone 17 Pro, MacBook Air and Pro, iPad Pro and Nothing Phone. Ready-made enter, exit, breathing and looping animations, camera effects driven by the cursor (zoom, shake, dolly, follow), and triggers on click, hover, scroll or cursor position. Performance can be checked before you ship it, and it drops into Webflow, Framer or plain HTML. Free tier available.",
      },
      {
        title: "Presenta",
        href: "https://presenta.design",
        dateAdded: "2026-07-29",
        description:
          "Device mockup generator by Deny Shepovalov under Craftwork Design, built around paste speed: take a screenshot, hit Cmd+V, and it lands on the canvas already framed. Frames for iPhone, MacBook, Apple Watch, iPad and browser windows, 48 background presets, real-time 3D rotation, perspective and depth of field, multiple artboards on one canvas for showing a flow, plus text and image layers. Exports PNG, JPG or WebP at 1x, 2x or 3x. All processing happens locally, so nothing uploads. Free with no watermark or limits; Presenta Pro adds AI site capture and background removal for $8/month or $20 lifetime.",
      },
      {
        title: "animos",
        href: "https://animos.app",
        dateAdded: "2026-07-25",
        description:
          "Browser tool that drops a design into a motion template and exports it as a showcase video, for producing an animated product shot without opening After Effects. Over 30 customizable templates, up to 4K, exporting MP4 or WebM; assets stay on your device with no upload, no cloud storage and no account gate on the core flow. Built solo by Herdetya Priambodo and launched on Product Hunt in July 2026 after a beta in which 5,000-plus users produced more than 9,000 exports.",
      },
      {
        title: "Hano",
        href: "https://www.hano.so/",
        dateAdded: "2026-07-25",
        description:
          "Browser-based 3D device mockup and animation studio: place a screen into a device, animate the scene, export a finished product visual. Worth reaching for when a flat 2D mockup will not sell the product but a real 3D pipeline is overkill. The site does not name its maker.",
      },
      {
        title: "ContentCore",
        href: "https://contentcore.xyz/",
        dateAdded: "2026-07-24",
        description:
          "Browser tool for building 3D device mockups, icons, and motion templates and exporting them as video, not just a static PNG. Where a normal mockup site hands you a flat image, ContentCore renders an animated scene you export as MP4 or WEBM for social, blog, or campaign use. Founded in 2024 out of Amsterdam, it runs on a subscription model with commercial export rights and picked up an Awwwards Honorable Mention.",
      },
      {
        title: "Free Newspaper Mockup (Brand New Mockup)",
        href: "https://brandnewmockup.com/mockups/free-newspaper-mockup-2-editable-psd-bnm-np-001",
        dateAdded: "2026-07-21",
        description:
          "A free two-scene newspaper mockup from Brand New Mockup: one folded cover and one open center spread, for showing editorial or ad layouts in print. Editable via smart objects, shipped as layered Photoshop 2025 PSDs plus InDesign 2024 files and JPG links, at 5504 x 8256 and 5225 x 7837 px. Free Standard license covers self-promotion by individuals and small businesses; Extended and Super Star tiers add commercial rights.",
      },
      {
        title: "Stone Deboss Mockup (Pixelbuddha)",
        href: "https://pixelbuddha.net/mockups/8275-stone-deboss-mockup",
        dateAdded: "2026-07-21",
        description:
          "A Pixelbuddha mockup that renders your artwork as text debossed into a rough stone slab, with carved grooves, shadows, chipped edges, and cracks, aimed at heritage brands, architecture and construction branding, packaging stamps, and signage previews. Smart-object PSD for recent Creative Cloud, 4500 x 3000 px at 300 dpi. Premium (paid).",
      },
      {
        title:
          "Free Citylight Poster Mockup, London Bus Stop (Brand New Mockup)",
        href: "https://brandnewmockup.com/mockups/free-citylight-poster-mockup-london-bus-stop-bnm-cl-014",
        dateAdded: "2026-07-21",
        description:
          "A free out-of-home poster mockup from Brand New Mockup, set in a citylight panel at a London bus stop against a brick wall, for previewing street advertising. Smart-object PSD (Photoshop 2024) and INDD (InDesign 2024) plus a JPG link, 2000 x 3000 px, with InDesign crop support for social sizes. Free Standard license for self-promotion (2 editors); paid Extended and Super Star tiers widen commercial use.",
      },
      {
        title: "A4 Poster Signage Mockup (Pixelbuddha)",
        href: "https://pixelbuddha.net/mockups/5229-a4-poster-signage-mockup",
        dateAdded: "2026-07-21",
        description:
          "A Pixelbuddha outdoor signage mockup showing an A4 poster in an urban setting framed by green trees, suited to eco campaigns, event and film-festival promos, and streetwear branding. Smart-object PSD with organized layers, built for the latest Creative Cloud. Premium (paid), commercial license available.",
      },
      {
        title: "Large Shipping Box Mockup (Pixelbuddha)",
        href: "https://pixelbuddha.net/mockups/11219-large-shipping-box-mockup",
        dateAdded: "2026-07-21",
        description:
          "A Pixelbuddha mockup of a cardboard shipping box held by a worker in a warehouse, for e-commerce packaging, delivery branding, and subscription-box concepts. One smart object covers the front print face; PSD at 4500 x 3000 px, 300 dpi. Premium (paid), commercial license available.",
      },
      {
        title: "Free MacBook Air and iPhone 13 Pro Mockup (Brand New Mockup)",
        href: "https://brandnewmockup.com/mockups/free-macbook-air-laptop-iphone-13-pro-mockup-bnm-lt-001",
        dateAdded: "2026-07-21",
        description:
          "A free device mockup from Brand New Mockup pairing a 15-inch MacBook Air M2 with an iPhone 13 Pro, in portrait and landscape scenes, for showing responsive or app work. Both screens are editable smart objects, and the wall, sofa, and floor recolor via Solid Color layers. PSD (Photoshop 2024) and INDD, at 5504 x 8256 and 7885 x 5257 px. Free Standard license for self-promotion; Extended and Super Star tiers add commercial rights.",
      },
      {
        title: "Stage Screen Mockup (Pixelbuddha)",
        href: "https://pixelbuddha.net/mockups/5356-stage-screen-mockup",
        dateAdded: "2026-07-21",
        description:
          "A Pixelbuddha mockup of a darkened theater with empty seats and a glowing screen, for presenting posters, trailers, motion graphics, or branding on the big screen. Smart-object PSD for quick placement, built for the latest Creative Cloud. Premium (paid).",
      },
      {
        title: "Free Tote Bag Mockup (Brand New Mockup)",
        href: "https://brandnewmockup.com/mockups/bnm-tb-001-free-tote-bag-mockup",
        dateAdded: "2026-07-21",
        description:
          "A free tote bag mockup from Brand New Mockup for showing branding or illustration on canvas, with colorable surfaces so individual elements recolor independently and Instagram crop presets via InDesign. Smart-object PSD (Photoshop 2024) plus INDD and a JPG link, 5504 x 8256 px. Free Standard license for self-promotion (2 editors); Extended and Super Star tiers add commercial rights.",
      },
      {
        title: "iPhone 15 Pro in-hand mockups",
        href: "https://pixelsurplus.com/collections/free-mockups/products/15-iphone-15-pro-in-hand-mockups",
        dateAdded: "2026-07-14",
        description:
          "Free pack of in-hand iPhone 15 Pro mockup shots for presenting app screens in a realistic, held-in-hand context. 15 PSD scenes at 3600x2400/300 DPI, each with four titanium color variants (silver, natural, black, blue) via Smart Objects.",
      },
      {
        title: "MacBook mockup on wooden chair",
        href: "https://mockups-design.com/macbook-mockup-on-wooden-chair",
        dateAdded: "2026-07-14",
        description:
          "Free lifestyle MacBook mockup: a laptop on a wooden chair in naturally lit surroundings. Ships as three PSD files with multiple angles and smart objects for dropping in your own screenshot. Three PSD scenes, free for commercial use with no attribution required, unlike many mockup sites that gate commercial rights behind a paid tier.",
      },
      {
        title: "MacBook Pro on folding chair",
        href: "https://unblast.com/macbook-pro-on-modern-folding-chair",
        dateAdded: "2026-07-14",
        description:
          "Free lifestyle MacBook Pro mockup staged on a modern folding chair, PSD with a smart-object screen for swapping in your own design. Licensed free for both personal and commercial use, with the screen swapped via a fully editable smart object layer.",
      },
      {
        title: "Ransom note letters",
        href: "https://resourceboy.com/graphics/ransom-note-letters",
        dateAdded: "2026-07-14",
        description:
          "Free set of cut-out, magazine-style ransom note letter graphics for collage-style headlines and covers. Over 1,000 PNGs, each letter, number, symbol, and pre-made word hand-cut and scanned individually across two months of production.",
      },
      {
        title: "Scribble textures",
        href: "https://resourceboy.com/textures/scribble-textures",
        dateAdded: "2026-07-14",
        description:
          "Free pack of hand-drawn scribble textures for adding a rough, doodled layer to designs. 500+ textures at 4K resolution, exported as transparent PNGs so scribbles layer directly onto any background color.",
      },
      {
        title: "200 crayon Photoshop brushes",
        href: "https://unblast.com/200-crayon-photoshop-brushes",
        dateAdded: "2026-07-14",
        description:
          "Free set of 200 crayon-texture Photoshop brushes for waxy, hand-colored strokes and shading. Shipped as high-resolution PSD elements rather than an .abr brush file, so strokes drop in as editable layers.",
      },
      {
        title: "Grunge brushes",
        href: "https://resourceboy.com/photoshop-brushes/grunge-brushes",
        dateAdded: "2026-07-14",
        description:
          "Free pack of grunge-texture Photoshop brushes for distressed, worn-in surface effects. 200+ brushes rendered at 4K, packaged in a single ZIP built for both digital and print-resolution work.",
      },
      {
        title: "UltraMock",
        href: "https://www.ultramock.io",
        dateAdded: "2026-07-14",
        description:
          "Turns a plain product screenshot into a polished, presentation-ready visual automatically, without manual compositing in Photoshop. Runs entirely in-browser on a pay-per-export credit model, so there's no app install or recurring subscription to commit to.",
      },
      {
        title: "Resourceboy patterns",
        href: "https://resourceboy.com/patterns",
        dateAdded: "2026-07-14",
        description:
          "Large library of free seamless patterns, from floral and geometric to '90s and watercolor styles, alongside the site's fonts, textures and brushes. Individual themed sets go deep, 1000+ heart, pirate, fruit, watercolor and skull patterns each, not just a handful of samples.",
      },
      {
        title: "Heritage Type free vintage illustrations",
        href: "https://www.heritagetype.com/pages/free-vintage-illustrations",
        dateAdded: "2026-07-14",
        description:
          "Hundreds of themed bundles of vintage illustrations pulled from historical archives, free for personal and commercial use in PNG and vector formats. Spans 279 numbered bundles drawing on public-domain masters like Alphonse Mucha, Edward Penfield, and naturalist Maria Sibylla Merian.",
      },
      {
        title: "ls.graphics paaatterns",
        href: "https://www.ls.graphics/products/paaatterns",
        dateAdded: "2026-07-14",
        description:
          "Free collection of 22 vector patterns in a range of styles, colors and moods from LS.GRAPHICS, the studio behind Colorflow. Delivered as pure vector files rather than raster tiles, so every pattern scales infinitely and recolors cleanly in Illustrator or Figma.",
      },
      {
        title: "Pattern Playground",
        href: "https://learn.every-tuesday.com/pattern-playground",
        dateAdded: "2026-07-14",
        description:
          "Free tool for testing seamless repeat patterns: upload an image, preview how it tiles, and try blend modes and repeat layouts like full drop, half drop and half brick. Runs fully client-side with no account or upload limit, and exports the tiled result straight to a ready-to-use JPG.",
      },
      {
        title: "House of Mockups freebies",
        href: "https://houseofmockups.com/collections/freebies",
        dateAdded: "2026-07-14",
        description:
          "Free tier of House of Mockups' library of PSD device mockups, typefaces and branding assets, alongside its paid premium collection. As of this check the collection holds 29 free products, several normally priced $5-$12, including free fonts like Letterpress Sans alongside the mockups.",
      },
      {
        title: "Are.na: cool characters",
        href: "https://www.are.na/t-hanks/cool-characters",
        dateAdded: "2026-07-14",
        description:
          "Curated Are.na channel collecting character design references under the name 'cool characters', useful for illustration and mascot inspiration. Curated solo by Are.na user t-hanks and cross-referenced from numerous other channels, making it a well-networked node in the character-design corner of Are.na.",
      },
      {
        title: "Paliotta mockup",
        href: "https://paliotta.gumroad.com/l/zzumsc",
        dateAdded: "2026-07-14",
        description:
          "Premium product mockup pack sold on Gumroad by designer Paliotta. The Gumroad listing itself is titled 'Free Business Card Mockup,' so despite being framed as premium here it may actually be a no-cost download.",
      },
      {
        title: "Architect mockup (Vitora)",
        href: "https://vitora.gumroad.com/l/architect-mockup",
        dateAdded: "2026-07-14",
        description:
          "Architectural presentation mockup pack sold on Gumroad by Vitora, for showcasing building and interior renders in a styled frame. Titled 'Architect and Construction Mockups' on Gumroad, meaning it spans raw construction-site scenes in addition to polished finished-building presentations.",
      },
      {
        title: "iPhone 17 mockup (Mockuply)",
        href: "https://mockuply.gumroad.com/1/iPhone17",
        dateAdded: "2026-07-14",
        description:
          "iPhone 17 device mockup pack from Mockuply, for presenting app screens on the current-generation iPhone. This exact product URL currently returns a 404 on Gumroad, so check Mockuply's storefront directly for the live iPhone 17 mockup listing.",
      },
    ],
  },
  {
    title: "Agent skills directories",
    links: [
      {
        title: "lieflat-charts",
        href: "https://github.com/larashero3-dotcom/lieflat-charts",
        dateAdded: "2026-09-01",
        kind: "skill",
        stack: [
          "claude-code",
          "codex",
          "agents",
          "skills",
          "charts",
          "svg",
          "echarts",
        ],
        useFor: [
          "chart skill",
          "html charts",
          "data visualization skill",
          "turn data into charts",
          "chart from csv",
          "editorial chart style",
          "svg chart templates",
        ],
        description:
          "Agent skill that turns a dataset into single-file interactive HTML charts, installed with npx skills add and read by anything that takes a SKILL.md, including Claude Code and Codex. The catalog indexes 49 chart types across three registers: Lupi, hand-written SVG with hairline strokes and per-record detail built for a 30 second read; Glance, thick bars and big numbers meant to land in seconds; and Basics, familiar bar, line and donut silhouettes with countable ticks. Mono greyscale is the default fallback, with three presets (Porcelain, Palm, Wire) and 12 bilingual full-page report templates that only fire when you explicitly ask for a report. Lupi and Basics render as native SVG, while Glance, Circular, Force and two report templates pull Chart.js or ECharts from a CDN, so those need network access. Built at moxt.ai by larashero3-dotcom, PolyForm Noncommercial 1.0.0, about 2.3k stars and 41 commits.",
      },
      {
        title: "video-shotcraft",
        href: "https://vincentwei1021.github.io/video-shotcraft/library.html",
        dateAdded: "2026-09-01",
        kind: "skill",
        stack: [
          "claude-code",
          "codex",
          "agents",
          "skills",
          "remotion",
          "video",
          "motion",
        ],
        useFor: [
          "product promo video",
          "cinematic video skill",
          "remotion shots",
          "motion shot recipes",
          "shot library",
          "product launch video",
          "video from code",
        ],
        description:
          "Agent skill for Claude Code and Codex that makes cinematic product promo videos with Remotion, by Vincent Wei (Vincentwei1021/video-shotcraft). This page is its shot library: 155 shot cards expanding into 212 named styles, each with a motion sample you can switch between, filtered across Opening and Brand, Typography, UI Entrance, Camera, Data, Interaction, Transitions, Rhythm, Light and Emphasis, and Outro. Recipes are written as mechanics rather than moods, so card-stack springs eight cards up into a pile then fans them into a 3D arc, carousel-3d billboards eight cards on a sin/cos ring through one full revolution so nothing reads mirrored, and counter-confetti bursts 52 pieces on real gravity arcs while the number sprints. Command-K search, batch copy of selected shots, dark mode and a Chinese toggle sit on the page; license and install steps are not here, they are in the repo.",
      },
      {
        title: "ip-as-logo",
        href: "https://github.com/s1dashu/ip-as-logo-skill/blob/main/SKILL.md",
        dateAdded: "2026-08-19",
        kind: "skill",
        stack: ["codex", "imagegen", "agents"],
        useFor: [
          "mascot logo",
          "generate a logo",
          "logo from repo context",
          "character mark",
          "image generation skill",
          "brand mascot",
        ],
        description:
          "Agent skill by s1dashu that generates minimalist mascot marks, logo first and character second, legible at 32 by 32. Its 13 step workflow reads the repo (README, package metadata, landing copy, design tokens) when no subject is given, asks one consolidated round of questions rather than a second questionnaire, then proposes three directions and six labeled candidates before generating anything. The constraints carry the whole thing: 6 to 10 geometric shapes, one species-defining feature, two IP colors plus a background, thick rounded contours with no needle tails or thin antennae, 75 to 85 percent canvas fill, and only 8 to 12 percent internal tonal modeling. Each candidate renders as its own 1536 square image, never a contact sheet. Prefers Codex with ImageGen, and routes exclusions to negative_prompt only on legacy models. Around 2k stars, license not stated in SKILL.md.",
      },
      {
        title: "pstack explained",
        href: "https://hustlecoding.github.io/pstack-explained/",
        dateAdded: "2026-08-19",
        kind: "essay",
        stack: ["claude-code", "agents", "skills"],
        useFor: [
          "pstack",
          "poteto mode",
          "agent playbooks",
          "coding agent skills",
          "skill routing",
          "agent principles",
          "models per role",
        ],
        description:
          "Unofficial reading aid for pstack, poteto's engineering skill pack for coding agents, installed with /add-plugin pstack. Lays out the 21 principles, 23 playbooks and 23 skills, then explains the routing: you type /poteto-mode, it matches a playbook, copies that playbook in full before any work starts, and fires skills as its steps. Six sections cover an interactive routing demo (keyword matching, not the real router), the playbook and skill catalogs, the principles grouped into five families, per-role model config through /setup-pstack, and a ten chapter guide running from setup through opening a PR and running work while you sleep. Source at HustleCoding/pstack-explained, deployed by GitHub Actions.",
      },
      {
        title: "skilltune",
        href: "https://www.skilltune.dev/",
        dateAdded: "2026-08-06",
        kind: "tool",
        stack: ["agents", "llm", "eval"],
        useFor: [
          "test agent skills",
          "skill.md eval",
          "benchmark skill.md",
          "tune coding agent skills",
          "lab tested skills",
          "export skill to claude code",
          "skill versioning",
        ],
        description:
          "Lab for creating, evaluating, and versioning SKILL.md files so agent skills are scored against locked eval cases instead of shipped on trust. Founded by CJ Zafir; the loop drafts evals, runs them on your target harness and model, keeps only versions that improve the score, and aims past 90 before export. Claims tuned skills can lift base models by about 15 to 20% from their testing on 500+ skills and 20+ models. Exports one-click to Claude Code, Codex, Cursor, opencode, and other harnesses. Pricing: web app at $24.99/month, or early-bird CLI plus web at $149/year for the first 500 accounts (runs on your Claude or ChatGPT subscription, skills stay local on that plan).",
      },
      {
        title: "agent-skills",
        href: "https://skills.addy.ie/",
        dateAdded: "2026-07-27",
        description:
          "Catalog site for Addy Osmani's agent-skills, 24 skills that encode senior engineering practice for AI coding agents and are grouped by where they land in the lifecycle: Define (interview-me, spec-driven-development), Build (incremental-implementation, test-driven-development, doubt-driven-development, frontend-ui-engineering), Review (code-review-and-quality, security-and-hardening, performance-optimization) and Ship (shipping-and-launch). Useful when you want a whole opinionated workflow rather than one narrow skill. Installs as a set with npx skills add addyosmani/agent-skills, claims compatibility with 70+ agents including Claude Code, Cursor, Copilot, Windsurf and Cline. MIT licensed at addyosmani/agent-skills, around 80,500 stars at time of adding.",
      },
      {
        title: "Animation vocabulary skill",
        href: "https://skills.sh/emilkowalski/skills/animation-vocabulary",
        dateAdded: "2026-07-24",
        description:
          'Agent skill by Emil Kowalski (Sonner and Vaul) that turns a loose description of a motion effect into its precise animation term. Feed it something vague and it returns the best-matching name with a short definition, for example "Stagger: animate several items one after another with a small delay between each, creating a cascade", then one or two alternatives with notes on how they differ. Published June 29, 2026, 43,300+ installs; part of the emilkowalski/skills repo, installed with npx skills add https://github.com/emilkowalski/skills --skill animation-vocabulary.',
      },
      {
        title: "write-better",
        href: "https://github.com/plannotator/write-better",
        dateAdded: "2026-07-23",
        description:
          "Agent skill by plannotator that steers drafting, rewriting, editing and review toward clear, direct prose that keeps the author's voice and does not invent facts, applying the Humanizer pattern catalog and Wikipedia's signs-of-AI-writing standards. Covers docs, workplace messages, essays, reports and interface copy. Installs via npx skills add plannotator/write-better or as a Claude Code or Codex plugin. MIT licensed, around 20 stars.",
      },
      {
        title: "SkillsMP",
        href: "https://skillsmp.com/",
        dateAdded: "2026-07-21",
        description:
          "A community marketplace that aggregates open-source AI coding agent skills and exposes them for Claude Code, Codex CLI, and ChatGPT. Useful when you want to search across a large pool of skills rather than a single GitHub repo. Claims 2,000,000+ skills spanning 12 domains and 50+ categories in 9 languages, with search, category and occupation filters, and a timeline of additions. Access is free through a REST API and an MCP server (OpenAPI spec provided): 50 requests per day anonymously, 500 per day with a free API key. Skills are described as open source; specific license terms are not stated.",
      },
      {
        title: "dmmulroy/skills",
        href: "https://github.com/dmmulroy/skills",
        dateAdded: "2026-07-21",
        description:
          "TypeScript engineering skills for coding agents, aimed at backend and architecture work rather than UI. Six skills by Dillon Mulroy: coding-standards (typed failures and domain modeling), bootstrap-prelude (building a prelude.ts foundation file), cloudflare-composition-root (Cloudflare bindings and runtime types), tech-spec (architecture handoff plus a TDD plan), herdr, and bro. It also vendors grilling, grill-me, grill-with-docs, domain-modeling, and tdd from mattpocock/skills. Each skill is a SKILL.md with colocated templates. MIT licensed, around 288 stars.",
      },
      {
        title: "Meng To Skills",
        href: "https://github.com/MengTo/Skills",
        dateAdded: "2026-07-15",
        description:
          "Collection of Claude skills for web design, packaging reusable visual design guidance and workflows for coding agents. Authored by Meng To, founder of Design+Code; the repo sits at roughly 2,387 GitHub stars as of mid-2026.",
      },
      {
        title: "0xdesign design-plugin",
        href: "https://github.com/0xdesign/design-plugin",
        dateAdded: "2026-07-14",
        description:
          "Claude Code plugin that iterates on UI design: generates multiple distinct component variations, lets you compare them side by side in the browser, and refines based on feedback, producing production-ready code (not mockups) for Next.js, Vite or Remix with Tailwind or Material UI. Ships as an installable Claude Code plugin (not a standalone CLI) and has drawn around 741 GitHub stars.",
      },
      {
        title: "Sub-Agents Directory",
        href: "https://sub-agents.directory",
        dateAdded: "2026-07-14",
        description:
          "Directory of 200+ ready-to-copy Claude Code sub-agent prompts across React, Python, TypeScript and more, plus a collection of MCP servers for Slack, Postgres, Figma and Vercel. Lists exactly 16 MCP servers alongside the prompts, plus a built-in Generate tool for creating custom sub-agent prompts on demand.",
      },
      {
        title: "ui-skills.com",
        href: "https://www.ui-skills.com",
        dateAdded: "2026-07-14",
        description:
          "Directory of AI agent skills focused on UI and design work, for installing pre-built design knowledge into a coding agent instead of writing it from scratch. Skills follow Claude's native SKILL.md format, so they drop straight into .claude/skills/ with no adapter or glue code needed.",
      },
      {
        title: "Dimillian skills",
        href: "https://github.com/dimillian/skills",
        dateAdded: "2026-07-14",
        description:
          "Collection of 16 reusable Claude Code skills by iOS developer Dimillian, covering Apple platform release notes, iOS debugging, SwiftUI and React performance work, macOS packaging, and multi-agent code review and bug-hunt swarms. Dimillian (Thomas Ricouard) is the developer behind the IceCubes Mastodon app, and the repo has around 3,838 GitHub stars.",
      },
      {
        title: "Kit Langton skills",
        href: "https://github.com/kitlangton/skills",
        dateAdded: "2026-07-15",
        description:
          'Kit Langton\'s agent skills collection, currently featuring an installable skill for writing production TypeScript with Effect v4. Also ships a Neovim-based "Code Walkthrough" skill for verified code tours, alongside the Effect skill, in a repo sitting at 238 GitHub stars.',
      },
      {
        title: "Fallow Tools: agent skills integration",
        href: "https://docs.fallow.tools/integrations/agent-skills",
        dateAdded: "2026-07-14",
        description:
          "Docs for wiring agent skills into the Fallow Tools developer suite. Wraps concrete `fallow` CLI commands like `dead-code --unused-exports` and `dupes` into skills usable across Claude Code, Cursor, Windsurf, and Gemini CLI.",
      },
      {
        title: "shadcn skills docs",
        href: "https://ui.shadcn.com/docs/skills",
        dateAdded: "2026-07-14",
        description:
          "Official shadcn/ui documentation for its agent skills, packaging shadcn/ui conventions and component knowledge as an installable skill for coding agents. Installs via `pnpm dlx skills add shadcn/ui` and auto-injects `shadcn info --json` output from your components.json straight into the agent's context.",
      },
      {
        title: "kalypso-claude-workflow",
        href: "https://github.com/Kalypsokichu-code/kalypso-claude-workflow",
        dateAdded: "2026-07-14",
        description:
          "Claude Code workflow configuration repo, the origin of the 'Kalypso' name used as a working title for this batch of links. Enforces a three-tier allow/ask/deny permission model through a single bash hook router, with a BATS test suite backing the setup.",
      },
      {
        title: "Marketing skills",
        href: "https://github.com/coreyhaines31/marketingskills",
        dateAdded: "2026-07-14",
        description:
          "Claude Code skills for marketing tasks by Corey Haines, packaging marketing frameworks and copywriting know-how as installable agent skills. Bundles 60+ skills, from CRO and SEO audits to cold outreach and pricing strategy, installable via `npx skills add` or as a Claude Code plugin.",
      },
      {
        title: "skills.sh",
        href: "https://skills.sh",
        dateAdded: "2026-07-14",
        description:
          "The open agent skills ecosystem: install reusable AI capabilities into coding agents with a single command, with a leaderboard of the most popular skills across categories like design, testing and cloud. The platform has tracked 937,697 skills all-time, with the top-ranked skill alone logging 2.6 million installs in 8 weeks.",
      },
      {
        title: "Vercel composition patterns skill",
        href: "https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns",
        dateAdded: "2026-07-14",
        description:
          "Official Vercel Labs agent skill that teaches a coding agent Vercel's component composition patterns. Installed 254.2K times, it packages 10+ named patterns and pushes React 19 idioms like use() over useContext() and dropping forwardRef.",
      },
      {
        title: "Web design guidelines skill",
        href: "https://skills.sh/vercel-labs/agent-skills/web-design-guidelines",
        dateAdded: "2026-07-14",
        description:
          "Official Vercel Labs agent skill that packages web design best practices for a coding agent to apply automatically. With 473.4K installs, it re-fetches Vercel's web-interface-guidelines repo live on every run, so checks stay current instead of going stale.",
      },
      {
        title: "SwiftUI Microinteractions",
        href: "https://github.com/iamvishal16/swiftui-microinteractions",
        dateAdded: "2026-07-14",
        description:
          "Claude Code / Cursor / Codex agent skill that generates production-ready SwiftUI micro-interactions from plain-English prompts, encoding spring physics presets, haptic feedback grammar and glass-morphism aesthetics drawn from the author's Animo animation library. Built atop the author's legendary-Animo repo of 84 hand-crafted SwiftUI animation demos, currently at v1.20.0 with 105 GitHub stars.",
      },
      {
        title: "Jakub Krehel skills",
        href: "https://jakub.kr/skills",
        dateAdded: "2026-07-19",
        description:
          "Jakub Krehel's directory of agent skills for product design and development, including /better-ui, /better-typography and /better-colors. Just three skills so far; better-colors alone works entirely in OKLCH for lightness-matched palettes and gamut-safe contrast fixes.",
      },
    ],
  },
  {
    title: "VPS and hosting videos",
    links: [
      {
        title: "Next.js hosting: Coolify, VPS, self-hosting",
        href: "https://www.youtube.com/watch?v=pk0DypMIZfM",
        dateAdded: "2026-07-14",
        description:
          "YouTube video walking through self-hosting a Next.js app with Coolify on a VPS, as an alternative to managed hosting platforms. Coolify is the open-source, self-hostable Heroku/Vercel alternative at the core of this workflow, handling Docker builds, SSL, and zero-downtime deploys for you.",
      },
      {
        title: "VPS hosting explainer",
        href: "https://www.youtube.com/watch?v=4guOChx7poQ",
        dateAdded: "2026-07-14",
        description:
          "YouTube video explaining what VPS hosting is and how it works. Focuses on the hypervisor layer itself: how a VPS carves guaranteed CPU, RAM, and disk out of a shared physical server versus true shared hosting.",
      },
      {
        title: "Should you use a VPS instead of Vercel, Netlify & co?",
        href: "https://www.youtube.com/watch?v=yVuyh95kqXk",
        dateAdded: "2026-07-14",
        description:
          "YouTube video weighing running your own VPS against managed platforms like Vercel and Netlify, covering the cost and control tradeoffs. Makes the case that serverless egress fees and function cold-starts, not raw compute price, are the real reason teams outgrow Vercel/Netlify for a flat-rate VPS.",
      },
      {
        title: "What is a VPS, everything you need to know",
        href: "https://www.youtube.com/watch?v=4zZiFTQoXRM",
        dateAdded: "2026-07-14",
        description:
          "Beginner-friendly YouTube explainer covering what a VPS is and the basics of setting one up. Frames the VPS pitch around cheap, always-on use cases like a Discord bot or small Postgres instance rather than full app hosting.",
      },
      {
        title: "Best value VPS provider: price to performance",
        href: "https://www.youtube.com/watch?v=FZRBw-_s8i0",
        dateAdded: "2026-07-14",
        description:
          "YouTube video comparing VPS providers on price-to-performance to find the best value option. Benchmarks the budget-VPS heavyweights, Hetzner and Contabo among them, whose aggressive specs-per-dollar undercut DigitalOcean and Linode.",
      },
    ],
  },
];

const SITE = "https://ui.aryank.space";

/**
 * Compact entry point served at /inspiration/llms.txt.
 *
 * The full catalog is ~400KB, which every agent truncates, so serving it as
 * the well-known file meant answers came from whatever fraction survived.
 * This is the llms.txt convention as intended: small, self-describing, and
 * pointing at the retrieval endpoint. Agents that never read a rules file
 * (Codex, Grok, Cursor, anything with a plain fetch tool) learn how to search
 * from the file they already know to look for. The complete corpus stays one
 * fetch away at llms-full.txt.
 */
export function inspirationIndexToMarkdown(
  groups: InspirationGroup[] = inspirationGroups,
): string {
  const total = groups.reduce((n, g) => n + g.links.length, 0);
  // Names and counts only. Spelling out 51 near-identical absolute URLs cost
  // more than half the file, and the ?category= pattern is already shown above.
  const categories = groups
    .map((group) => `- ${group.title} (${group.links.length})`)
    .join("\n");

  return `# Inspiration

> Curated directory of ${total} vetted frontend, design and engineering
> resources: component libraries, animation tools, typefaces, color systems,
> WebGL, design galleries and reference reading. Maintained at ${SITE}.

This index is small on purpose. Do not fetch the full dump to answer a
question: it is ~400KB, your fetch will truncate it, and you will recommend
from whatever fraction survived.

## Direction (default for agents)

When choosing UI, libraries, taste, or installables, call direction first:

    curl -s "${SITE}/direction?q=scroll+driven+animation"

Returns registry installables (\`reg_*\`) and wall picks (\`insp_*\`). Cite both.

Wall-only:

    curl -s "${SITE}/inspiration/recommend?q=scroll+driven+animation"

Returns at most 3 picks with id + why (~2KB). Server expands the query, merges
variants, boosts category/kind/style/use-for facets, and drops weak matches.

Rules for the agent:
1. Prefer /direction. Wall-only recommend is fine for pure reference asks.
2. Recommend only from Picks (max 3). Cite \`From wall: Title (insp_…) — why\`.
3. If picks miss, say so; off-wall only as \`outside-second-brain: …\`.
4. Never dump the full catalog or fetch llms-full to answer a question.

## Wider search

    curl -s "${SITE}/inspiration/search?q=scroll+driven+animation"

Returns about 12 ranked candidates when you need a broader pool. Prefer
recommend for final answers.

- \`&limit=25\` widens the pool when the first pass looks thin.
- \`?category=Free+typefaces\` returns one category in full.
- Matching is lexical; recommend does multi-query expansion for you.

## Categories (${groups.length})

Browse any one in full with \`${SITE}/inspiration/search?category=<name>\`,
URL-encoding the name.

${categories}

## Everything

- [Recommend](${SITE}/inspiration/recommend?q=): opinionated top picks
- [Search](${SITE}/inspiration/search?q=): wider candidate pool
- [Full catalog](${SITE}/inspiration/llms-full.txt): all ${total} links with
  full descriptions, ~400KB. Fetch only if you genuinely need the whole corpus
  rather than an answer to a question.
- [Browse on the web](${SITE}/inspiration)
`;
}

/** Full catalog as markdown for /inspiration/llms-full.txt and LLM tooling. */
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
    "This is the complete catalog, ~400KB. To answer a question, do not read",
    `it all: ${SITE}/inspiration/recommend?q=your+question returns at most 3`,
    "picks with a why. Prefer that. Wider pool:",
    `${SITE}/inspiration/search?q=... (~12). Category browse:`,
    `?category=Free+typefaces. The small index is ${SITE}/inspiration/llms.txt.`,
    "",
    "---",
    "",
  ];

  for (const group of groups) {
    lines.push(`## ${group.title}`, "");
    const usage = GROUP_USAGE[group.title];
    if (usage) {
      lines.push(`_${usage}_`, "");
    }
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
