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
      { title: "React Flow", href: "https://reactflow.dev/" },
      { title: "Made With React", href: "https://madewithreactjs.com/" },
      {
        title: "React Handbook",
        href: "https://devouringdetails.com/resources/react-handbook",
      },
      {
        title: "React Fiber, part 1",
        href: "https://kishore.app/blog/fiber-part-1?utm_source=x",
      },
      {
        title: "React Tricks",
        href: "https://molefrog.com/notes/react-tricks",
      },
      {
        title: "Web Workers with React",
        href: "https://www.rahuljuliato.com/posts/react-workers",
      },
      {
        title: "Prod-ready React hooks",
        href: "https://4markdown.com/1-prod-ready-react-usefeature-and-usesimplefeature-hooks/",
      },
      {
        title: "React TypeScript Cheatsheet",
        href: "https://react-typescript-cheatsheet.netlify.app/docs/basic/getting-started/forms_and_events/",
      },
      { title: "TkDodo's blog", href: "https://tkdodo.eu/blog/all" },
      { title: "React Grab", href: "https://react-grab.com/" },
      {
        title: "React Quill",
        href: "https://zenoamaro.github.io/react-quill/",
      },
    ],
  },
  {
    title: "React Native and mobile",
    links: [
      {
        title: "React Native Reusables",
        href: "https://reactnativereusables.com/",
      },
      {
        title: "React Native Audio API",
        href: "https://docs.swmansion.com/react-native-audio-api/",
      },
      {
        title: "React Native data detector",
        href: "https://github.com/pablogdcr/react-native-data-detector",
      },
      { title: "Expo Demos", href: "https://expo.dev/demos" },
      { title: "Margelo", href: "https://margelo.com/" },
    ],
  },
  {
    title: "JavaScript and TypeScript",
    links: [
      {
        title: "Making html_of_jsx 10x faster",
        href: "https://sancho.dev/blog/making-html-of-jsx-10x-faster",
      },
      {
        title: "Eloquent JavaScript: values",
        href: "https://eloquentjavascript.net/01_values.html",
      },
      {
        title: "Eloquent JavaScript: program structure",
        href: "https://eloquentjavascript.net/02_program_structure.html",
      },
      {
        title: "Exploring JS",
        href: "https://exploringjs.com/js/book/index.html",
      },
      {
        title: "You Don't Know JS",
        href: "https://github.com/getify/You-Dont-Know-JS",
      },
      {
        title: "Myers diff algorithm",
        href: "https://www.30secondsofcode.org/js/s/myers-diff-algorithm/",
      },
      {
        title: "30 seconds of code",
        href: "https://www.30secondsofcode.org/js/p/1/",
      },
      { title: "VisualizeJS", href: "https://visualizejs.com/javascript" },
    ],
  },
  {
    title: "Web platform, CSS and performance",
    links: [
      {
        title: "How modern browsers work",
        href: "https://addyo.substack.com/p/how-modern-browsers-work",
      },
      {
        title: "A friendly intro to container queries",
        href: "https://www.joshwcomeau.com/css/container-queries-introduction/",
      },
      {
        title: "Picture perfect image optimization",
        href: "https://bholmes.dev/blog/picture-perfect-image-optimization/",
      },
      { title: "SVG tutorial", href: "https://svg-tutorial.com/summary" },
      { title: "WebHaptics", href: "https://haptics.lochie.me/" },
      { title: "WebVitals", href: "https://webvitals.com/" },
    ],
  },
  {
    title: "Frontend architecture and patterns",
    links: [
      { title: "Patterns.dev", href: "https://www.patterns.dev/" },
      {
        title: "GreatFrontend blog",
        href: "https://www.greatfrontend.com/blog",
      },
      {
        title: "Fundamentals of Frontend Architecture",
        href: "https://frontendatscale.com/courses/frontend-architecture/foundations/introduction/",
      },
      { title: "JSON Render", href: "https://json-render.dev/" },
      { title: "Puck", href: "https://github.com/measuredco/puck" },
      { title: "Workflow SDK", href: "https://workflow-sdk.dev/" },
    ],
  },
  {
    title: "Icons",
    links: [
      { title: "Iconiqui", href: "https://iconiqui.com/" },
      {
        title: "Animate UI icons",
        href: "https://animate-ui.com/docs/icons?icon=volume-1",
      },
      { title: "Phosphor Icons", href: "https://phosphoricons.com/" },
      { title: "Reicon", href: "https://reicon.dev/usage/react" },
      {
        title: "Heroicons Animated",
        href: "https://www.heroicons-animated.com/",
      },
      { title: "Glyphs", href: "https://glyphs.fyi/dir?i=hourglass" },
    ],
  },
  {
    title: "UI kit directories",
    links: [
      { title: "basecn", href: "http://basecn.dev" },
      { title: "smoothui", href: "http://smoothui.dev" },
      { title: "Hexta UI", href: "http://hextaui.com" },
      { title: "Tailark", href: "http://tailark.com" },
      { title: "Luxe UI", href: "http://luxeui.com" },
      { title: "Animate UI", href: "http://animate-ui.com" },
      { title: "Magic UI", href: "http://magicui.design" },
      { title: "HeroUI", href: "http://heroui.com" },
      { title: "Coss UI", href: "http://coss.com/ui" },
      { title: "Shoelace", href: "https://shoelace.style/" },
    ],
  },
  {
    title: "Component libraries and blocks",
    links: [
      {
        title: "Awesome shadcn/ui",
        href: "https://awesome-shadcn-ui.vercel.app/",
      },
      { title: "Origin UI", href: "https://github.com/origin-space/originui" },
      { title: "Fancy Components", href: "https://www.fancycomponents.dev/" },
      { title: "Componentry", href: "https://www.componentry.fun/docs" },
      { title: "React Bits", href: "https://reactbits.dev/" },
      { title: "Intent UI", href: "https://intentui.com/components" },
      { title: "Unlumen UI", href: "https://ui.unlumen.com/" },
      {
        title: "Watermelon UI",
        href: "https://ui.watermelon.sh/animated-components/category/tabs",
      },
      { title: "Eldora UI", href: "https://www.eldoraui.site/docs" },
      { title: "Bklit charts", href: "https://ui.bklit.com/" },
      { title: "Reactix", href: "https://www.reacticx.com/" },
      {
        title: "Nexvyn UI",
        href: "https://ui.nexvyn.dev/components/bounce-sidebar",
      },
      {
        title: "beUI",
        href: "https://beui.dev/components/blocks/overflow-actions",
      },
      { title: "ReUI", href: "https://reui.io/components/tooltip" },
      {
        title: "Molecule UI",
        href: "https://www.moleculeui.design/docs/components/profile-menu",
      },
      {
        title: "Spectrum UI",
        href: "https://ui.spectrumhq.in/docs/multistepform",
      },
      {
        title: "Shark UI",
        href: "https://shark.vini.one/docs/components/tour",
      },
      {
        title: "GAIA UI",
        href: "https://ui.heygaia.io/docs/components/component-preview-tooltip",
      },
      {
        title: "Morphin",
        href: "https://morphin.dev/components/scroll-scramble-section",
      },
      {
        title: "uselayouts",
        href: "https://uselayouts.com/docs/components/animated-collection",
      },
      { title: "Boneyard", href: "https://boneyard.vercel.app/overview" },
      { title: "Kairo UI", href: "https://www.kairoui.online/templates" },
      {
        title: "Liquid Glass OSS",
        href: "https://liquid-glass-oss.vercel.app/",
      },
      { title: "framecn", href: "https://www.framecn.dev/" },
      {
        title: "shadcn minimal Tiptap",
        href: "https://shadcn-minimal-tiptap.vercel.app",
      },
      { title: "tweakcn", href: "https://tweakcn.com/editor/theme" },
      {
        title: "Code Blocks by pheralb",
        href: "https://code-blocks.pheralb.dev/",
      },
      {
        title: "Shadcncraft tooltip",
        href: "https://shadcncraft.com/components/official-shadcn/tooltip",
      },
      {
        title: "mindmapcn",
        href: "https://mindmapcn.vercel.app/docs/installation",
      },
      {
        title: "Micro FAQs",
        href: "https://micro.bossadizenith.me/components/faqs",
      },
      {
        title: "Vengeance UI",
        href: "https://www.vengenceui.com/components/twisting-ribbon",
      },
      {
        title: "jal-co JSON viewer",
        href: "https://ui.justinlevine.me/docs/components/json-viewer",
      },
      { title: "Evil Charts", href: "https://evilcharts.com/docs" },
      {
        title: "Eldora card flip hover",
        href: "https://www.eldoraui.site/docs/components/card-flip-hover",
      },
      { title: "Border Beam", href: "https://beam.jakubantalik.com/" },
      {
        title: "React Wheel Picker",
        href: "https://react-wheel-picker.chanhdai.com/",
      },
      {
        title: "RigidUI",
        href: "https://www.rigidui.com/docs/hooks/use-location",
      },
      {
        title: "Solace UI",
        href: "https://www.solaceui.com/sections/hero-section",
      },
      {
        title: "tnks data table",
        href: "https://github.com/jacksonkasi1/tnks-data-table",
      },
      { title: "Driver.js", href: "https://driverjs.com/" },
      { title: "use-gesture", href: "https://use-gesture.netlify.app/" },
      {
        title: "Tripwire dither kit",
        href: "https://www.tripwire.sh/dither-kit",
      },
      {
        title: "beUI motion radio",
        href: "https://beui.dev/components/motion/radio",
      },
      {
        title: "Skiper UI drag and scroll",
        href: "https://skiper-ui.com/v1/skiper5",
      },
      { title: "Klick Here", href: "https://klick-here.vercel.app/" },
    ],
  },
  {
    title: "Interface design guidelines and craft",
    links: [
      { title: "userinterface.wiki", href: "https://www.userinterface.wiki/" },
      {
        title: "Vercel Web Interface Guidelines",
        href: "https://vercel.com/design/guidelines",
      },
      {
        title: "Components Build principles",
        href: "https://www.components.build/principles",
      },
      {
        title: "System button",
        href: "https://devouringdetails.com/system/button",
      },
      { title: "LINE Design System", href: "https://designsystem.line.me/" },
      { title: "Impeccable", href: "https://impeccable.style/#downloads" },
      { title: "Hit area", href: "https://bazza.dev/craft/2026/hit-area" },
      { title: "Designing Depth", href: "https://rauno.me/craft/depth" },
      { title: "New Interfaces", href: "https://www.interfaces.new/" },
      { title: "Design Engineers", href: "http://designengineers.net" },
      {
        title: "Industrial Empathy",
        href: "https://www.industrialempathy.com/",
      },
      { title: "Notch case study", href: "https://iamnoman.com/notch" },
      { title: "Dot Matrix", href: "https://dotmatrix.zzzzshawn.cloud/" },
      { title: "Interfaces.dev", href: "https://interfaces.dev/" },
      {
        title: "Make interfaces feel better",
        href: "https://jakub.kr/skills/make-interfaces-feel-better",
      },
      { title: "Mockdown", href: "https://www.mockdown.design/" },
      { title: "Unsung", href: "https://unsung.aresluna.org/" },
      { title: "TOLIS technical drawing", href: "https://tol.is/blueprint" },
    ],
  },
  {
    title: "Design inspiration galleries",
    links: [
      { title: "Details Inspo", href: "https://www.details.so/inspo" },
      { title: "Inspo Page", href: "https://www.inspo.page/" },
      { title: "Design Engineer Tools", href: "https://designengineer.tools/" },
      { title: "Items Design", href: "https://items.design/" },
      { title: "Landbook", href: "https://land-book.com/" },
      { title: "Recent Design", href: "https://recent.design/" },
      { title: "Dark Mode Design", href: "https://www.darkmodedesign.com/" },
      { title: "Next.js Design", href: "https://www.nextjs.design/products" },
      {
        title: "Pillarstack",
        href: "https://www.pillarstack.com/resources/doing-cool-stuff",
      },
      {
        title: "Craftwork catalog",
        href: "https://craftwork.design/catalog?filterByPrice=paid_free&sort=recent",
      },
      { title: "Shoot Design", href: "https://www.shoot.design/" },
      { title: "Websitevice", href: "https://websitevice.com/examples-5" },
      { title: "Osmo collection", href: "https://www.osmo.supply/collection" },
      { title: "Landing Love", href: "https://www.landing.love/" },
      { title: "Best Designs on X", href: "https://bestdesignsonx.com/" },
      {
        title: "Figma community resources",
        href: "https://www.figma.com/files/team/1072912386122463093/resources/community/file/1403172659817779958",
      },
    ],
  },
  {
    title: "Portfolios and studios",
    links: [
      { title: "Naked City Films", href: "https://www.nakedcityfilms.com/" },
      { title: "Brass Hands", href: "https://brasshands.com/" },
      { title: "Ning H", href: "https://ning-h.com/" },
      { title: "Maximilian Berndt", href: "https://maximilianberndt.com/" },
      { title: "Nitish Khagwal", href: "https://khagwal.com/" },
      {
        title: "Julia Plaza",
        href: "https://www.hoverstat.es/features/julia-plaza/",
      },
      { title: "Fabio Ottaviani", href: "https://www.supah.it/portfolio/" },
      { title: "Arlan Marat vault", href: "https://www.arlan.me/vault" },
      { title: "Jakub Krehel", href: "https://jakub.kr/" },
      { title: "Here For Now", href: "https://www.herefornow.risd.gd/" },
      { title: "Anaiis", href: "https://www.anaiis.world/#bpe" },
      { title: "Samuel Bernhardt", href: "https://www.samuelbernhardt.com/" },
      { title: "MILEZ", href: "https://milez.jp/article/kxhvhoyep55g/" },
      { title: "Emil Kowalski", href: "https://emilkowal.ski/" },
      { title: "Maxime Heckel", href: "https://maximeheckel.com/" },
    ],
  },
  {
    title: "Color, gradients and palettes",
    links: [
      { title: "Super Color Palette", href: "https://supercolorpalette.com/" },
      { title: "Pattern Craft", href: "https://patterncraft.fun/" },
      { title: "Gradient SCSS", href: "https://gradientscss.vercel.app/" },
      { title: "WebGradients", href: "https://webgradients.com/" },
      {
        title: "MyColor Space",
        href: "https://mycolor.space/gradient?ori=to+right+top&hex=%23A1C4FD&hex2=%23C2E9FB&sub=1",
      },
      {
        title: "Understanding Gradients",
        href: "https://jakub.kr/work/gradients",
      },
      { title: "Poline", href: "https://meodai.github.io/poline" },
    ],
  },
  {
    title: "Illustration and visual assets",
    links: [
      { title: "Popsy illustrations", href: "https://popsy.co/illustrations" },
      {
        title: "Grafik Stash",
        href: "https://grafikstash.com/class/freebies/",
      },
      {
        title: "Dither Garden",
        href: "https://www.dithergarden.com/editor.html",
      },
      {
        title: "Custom text highlight",
        href: "https://custom-text-highlight.vercel.app/",
      },
      {
        title: "Toolfolio OG Image Gallery",
        href: "https://toolfolio.io/og-image-gallery",
      },
      { title: "SVG Logos", href: "https://svgl.app/" },
      { title: "Tiny Design Shop", href: "https://tinydesignshop.com/" },
      {
        title: "Image generation by Jakub",
        href: "https://image.jakubantalik.com/",
      },
    ],
  },
  {
    title: "Typography and fonts",
    links: [
      { title: "Fontshare pairs", href: "https://fontshare.com/pairs" },
      { title: "Departure Mono", href: "https://departuremono.com/" },
      {
        title: "Random Grotesque",
        href: "https://randommaerks.github.io/random-grotesque",
      },
      {
        title: "Overused Grotesk",
        href: "https://randommaerks.github.io/overused-grotesk",
      },
      { title: "vibe.type", href: "https://typevibe.vercel.app/" },
      { title: "Collletttivo", href: "http://collletttivo.it" },
      { title: "Open Foundry", href: "http://open-foundry.com" },
      {
        title: "League of Moveable Type",
        href: "http://theleagueofmoveabletype.com",
      },
      { title: "Use & Modify", href: "http://usemodify.com" },
      { title: "Indestructible Type", href: "http://indestructibletype.com" },
      { title: "Velvetyne", href: "http://velvetyne.fr" },
      { title: "Uncut", href: "http://uncut.wtf" },
      { title: "Free Faces", href: "http://freefaces.gallery" },
      {
        title: "Base Neue Font",
        href: "https://befonts.com/base-neue-font.html",
      },
      { title: "Best Free Fonts", href: "http://bestfreefonts.com" },
      { title: "Tunera", href: "http://tunera.xyz" },
      { title: "Typotheque Luuse", href: "http://typotheque.luuse.fun" },
    ],
  },
  {
    title: "Branding and logo archives",
    links: [
      { title: "Logo System", href: "http://logosystem.co" },
      { title: "Logggos Club", href: "http://logggos.club" },
      { title: "Brand Archive", href: "http://brandarchive.xyz" },
      { title: "Rebrand Gallery", href: "http://rebrand.gallery" },
      { title: "Logo Archive", href: "http://logo-archive.org" },
      { title: "Brand New", href: "http://underconsideration.com/brandnew" },
      { title: "Cosmos", href: "http://cosmos.so" },
      { title: "Are.na", href: "http://are.na" },
      { title: "Logobook", href: "http://logobook.com" },
    ],
  },
  {
    title: "Design essays and culture",
    links: [
      { title: "Path to Design", href: "https://www.pathtodesign.com/" },
      {
        title: "The World According to Umbra",
        href: "https://arenamag.com/articles/the-world-according-to-umbra",
      },
      { title: "Byrne's Euclid", href: "https://c82.net/euclid/" },
      { title: "Bret Victor references", href: "https://worrydream.com/refs/" },
      {
        title: "The Cypherpunk Library",
        href: "https://www.cypherpunkbooks.com/",
      },
    ],
  },
  {
    title: "Animation and motion",
    links: [
      { title: "Animations on the Web", href: "https://animations.dev/demo" },
      { title: "Transitions.dev", href: "https://transitions.dev/" },
      { title: "Ripplix", href: "https://www.ripplix.com/" },
      { title: "Motion Core", href: "https://motion-core.dev/" },
      {
        title: "Variant Vault",
        href: "https://variantvault.chrisabdo.dev/text-variants",
      },
      {
        title: "Tailwind CSS Animations",
        href: "https://tailwindcss-animations.vercel.app/",
      },
      {
        title: "Animista",
        href: "https://animista.net/play/basic/flip/flip-diagonal-2-tl",
      },
      { title: "Fliiipbook", href: "https://www.fliiipbook.com/animate" },
      { title: "Text Motion", href: "https://textmotion.dev/" },
      {
        title: "Spring Physics in CSS",
        href: "https://www.carmenansio.com/articles/spring-physics-css",
      },
      { title: "Anime.js", href: "https://animejs.com/" },
      { title: "glimm", href: "https://glimm.dev/" },
      { title: "Satteri", href: "https://satteri.bruits.org/" },
      { title: "Lina scroll area", href: "https://lina.sameer.sh/" },
      { title: "aMicro", href: "https://amicro.vercel.app/" },
      { title: "Kexsio animations", href: "https://www.kexsio.com/animations" },
      {
        title: "Motionary",
        href: "https://motionary.dev/creators/6949b8263085772eb831634a",
      },
    ],
  },
  {
    title: "WebGL, shaders and creative coding",
    links: [
      {
        title: "The Book of Shaders",
        href: "https://thebookofshaders.com/06/",
      },
      {
        title: "Drei AsciiRenderer",
        href: "https://drei.docs.pmnd.rs/abstractions/ascii-renderer",
      },
      { title: "GLSL Sandbox", href: "https://mrdoob.com/#/139/glsl_sandbox" },
      {
        title: "Chrome Experiments",
        href: "https://experiments.withgoogle.com/collection/chrome",
      },
      {
        title: "Fluid pendant",
        href: "https://mitxela.com/projects/fluid-pendant",
      },
      { title: "Floor796", href: "https://floor796.com/#wandering" },
      { title: "Heerich", href: "https://meodai.github.io/heerich/" },
      {
        title: "Whitespace Experiments",
        href: "https://experiments.thisiswhitespace.com/",
      },
      {
        title: "Shaders hero section",
        href: "https://v0.app/templates/shaders-hero-section-cJOO8mnVR01?ref=Z0HBR4",
      },
      {
        title: "Cells to Pixels",
        href: "https://cells2pixels.github.io/#growing",
      },
      {
        title: "Awwwards WebGL and HTML course",
        href: "https://www.awwwards.com/academy/course/merging-webgl-and-html-worlds/lectures/7a14a7a1-72fe-428c-b5c1-680d7b90c026",
      },
      {
        title: "Awwwards interactive 3D scenes course",
        href: "https://www.awwwards.com/academy/course/the-fun-process-of-creating-lively-interactive-3d-scenes-for-the-web/lectures/d84661d2-bc8d-4a55-9928-280aba8b92b2",
      },
    ],
  },
  {
    title: "Audio, video and media",
    links: [
      {
        title: "Audio by Raphael Salaja",
        href: "https://audio.raphaelsalaja.com/",
      },
      { title: "soundcn", href: "https://www.soundcn.xyz/" },
      { title: "soundzjs", href: "https://soundzjs.vercel.app/docs" },
      { title: "Remocn", href: "https://www.remocn.dev/docs/compositions" },
      { title: "Mediabunny", href: "https://mediabunny.dev/" },
      { title: "VERT", href: "https://vert.sh/" },
      { title: "Optimo", href: "https://optimo.microlink.io/" },
      {
        title: "Apple TV recreation",
        href: "https://www.frontend.fyi/tutorials/rebuilding-the-apple-tv-plus-website-with-framer-motion-and-tailwind",
      },
      {
        title: "Supertonic",
        href: "https://github.com/supertone-inc/supertonic",
      },
      { title: "Web Reel", href: "https://webreel.dev/" },
      {
        title: "WebRTC video streaming",
        href: "https://blog.logrocket.com/webrtc-video-streaming/",
      },
    ],
  },
  {
    title: "LLMs and AI engineering",
    links: [
      {
        title: "Vibe coding is not AI-assisted engineering",
        href: "https://addyo.substack.com/p/vibe-coding-is-not-the-same-as-ai",
      },
      {
        title: "Building an elite AI engineering culture",
        href: "https://www.cjroth.com/blog/2026-02-18-building-an-elite-engineering-culture",
      },
      {
        title: "Effective communication in AI engineering",
        href: "https://jxnl.co/writing/2024/10/15/effective-communication-in-ai-engineering-moving-beyond-vague-updates/",
      },
      {
        title: "How LLMs actually work",
        href: "https://www.0xkato.xyz/how-llms-actually-work/",
      },
      { title: "LLM Visualization", href: "https://bbycroft.net/llm" },
      {
        title: "The Transformers",
        href: "https://www.vizuaranewsletter.com/p/the-transformers",
      },
      {
        title: "LLM Architecture Gallery",
        href: "https://sebastianraschka.com/llm-architecture-gallery/",
      },
      { title: "Hyperagents", href: "https://arxiv.org/abs/2603.19461" },
      { title: "arXiv 2501.02305", href: "https://arxiv.org/pdf/2501.02305" },
      { title: "FMHY AI", href: "https://fmhy.net/ai" },
      {
        title: "Kill the bloat in Claude Code's system prompt",
        href: "https://www.aihero.dev/how-to-kill-the-bloat-in-claude-codes-system-prompt",
      },
      {
        title: "KV Cache explained intuitively",
        href: "https://medium.com/@saad.ahmed1926q/kv-cache-explained-intuitively-2b425a36dfc7",
      },
      {
        title: "Berkeley EECS technical report",
        href: "https://www2.eecs.berkeley.edu/Pubs/TechRpts/2016/Archive/EECS-2016-143.pdf",
      },
      {
        title: "How I use LLMs, Karpathy",
        href: "https://www.youtube.com/watch?v=EWvNQjAaOHw",
      },
    ],
  },
  {
    title: "Machine learning and deep learning",
    links: [
      {
        title: "Maths, CS and AI compendium",
        href: "https://github.com/HenryNdubuaku/maths-cs-ai-compendium",
      },
      { title: "ML Visualizer", href: "https://mlvisualizer.org/" },
      {
        title: "TensorFlow Playground",
        href: "https://playground.tensorflow.org/",
      },
      { title: "GPU Glossary", href: "https://modal.com/gpu-glossary" },
      {
        title: "Quantization from the ground up",
        href: "https://ngrok.com/blog/quantization",
      },
      {
        title: "TurboQuant",
        href: "https://research.google/blog/turboquant-redefining-ai-efficiency-with-extreme-compression/",
      },
      {
        title: "Best resources to learn deep learning",
        href: "https://www.mltut.com/best-resources-to-learn-deep-learning/",
      },
      { title: "Algebrica", href: "https://algebrica.org/" },
    ],
  },
  {
    title: "AI tools, agents and search",
    links: [
      { title: "ai-cli", href: "https://ai-cli.dev/" },
      { title: "Models.dev", href: "https://models.dev/" },
      { title: "ai-ng", href: "https://github.com/ai-ng" },
      {
        title: "AI tool system prompts",
        href: "https://github.com/x1xhlol/system-prompts-and-models-of-ai-tools/tree/main/Amp",
      },
      {
        title: "Hegelian dialectic skill",
        href: "https://github.com/KyleAMathews/hegelian-dialectic-skill",
      },
      { title: "c0da", href: "https://c0da.org/" },
      { title: "Ostralyan", href: "https://ostralyan.com/" },
      {
        title: "Emil Kowalski skills",
        href: "https://github.com/emilkowalski/skills",
      },
      {
        title: "Matt Pocock skills",
        href: "https://github.com/mattpocock/skills",
      },
      {
        title: "David Ondrej skills",
        href: "https://github.com/davidondrej/skills",
      },
      {
        title: "Building a web search engine from scratch",
        href: "https://blog.wilsonl.in/search-engine/",
      },
      { title: "Orama", href: "https://github.com/oramasearch/orama" },
      { title: "Streamdown", href: "https://streamdown.ai/" },
      {
        title: "code-chunk",
        href: "https://github.com/supermemoryai/code-chunk/blob/main/packages/code-chunk/src/chunker.ts",
      },
      { title: "integrations.sh", href: "https://integrations.sh/" },
      { title: "Boring Computers", href: "https://boringcomputers.com/" },
    ],
  },
  {
    title: "Backend engineering",
    links: [
      {
        title: "Laws of Software Engineering",
        href: "https://lawsofsoftwareengineering.com/",
      },
      {
        title: "The hidden performance cost of Node and GraphQL",
        href: "https://www.softwareatscale.dev/p/the-hidden-performance-cost-of-nodejs",
      },
      {
        title: "Systems Engineering",
        href: "https://www.ashpreetbedi.com/articles/systems-engineering",
      },
      {
        title: "The many JavaScript runtimes of the last decade",
        href: "https://buttondown.com/whatever_jamie/archive/the-many-many-many-javascript-runtimes-of-the-last-decade/",
      },
      { title: "Serverless Horrors", href: "https://serverlesshorrors.com/" },
      { title: "V8 research grant", href: "https://v8.dev/grant" },
      { title: "Tech Vault", href: "https://github.com/moabukar/tech-vault/" },
      {
        title: "Refactoring and Design Patterns",
        href: "https://refactoring.guru/",
      },
      { title: "JWT anatomy", href: "https://rmrf.tips/en/posts/jwt-anatomy/" },
      {
        title: "Understanding Streams in Node.js",
        href: "https://nodesource.com/blog/understanding-streams-in-nodejs",
      },
      {
        title: "What Node.js is",
        href: "https://www.thenodebook.com/node-arch/what-is-nodejs",
      },
      {
        title: "SSE vs WebSockets",
        href: "https://neciudan.dev/sse-vs-websockets",
      },
      {
        title: "Server survival",
        href: "https://github.com/pshenok/server-survival",
      },
      {
        title: "Backend from first principles",
        href: "https://github.com/hanspaa2017108/backend-from-first-principles-sriniously",
      },
      { title: "tinbase", href: "https://www.tinbase.dev/" },
    ],
  },
  {
    title: "Databases and storage",
    links: [
      {
        title: "Databasemaxxing",
        href: "https://pthorpe92.dev/databasemaxxing/",
      },
      {
        title: "High memory usage in Postgres is good",
        href: "https://planetscale.com/blog/high-memory-usage-in-postgres-is-good-actually",
      },
      {
        title: "Patterns for Postgres traffic control",
        href: "https://planetscale.com/blog/patterns-for-postgres-traffic-control",
      },
      {
        title: "FokosDB",
        href: "https://www.lambrospetrou.com/articles/fokosdb/",
      },
      {
        title: "Database connections and pooling",
        href: "https://sagarshiroya.dev/posts/database-connection-and-pooling",
      },
      {
        title: "MySQL for developers",
        href: "https://planetscale.com/learn/courses/mysql-for-developers/schema/introduction-to-schema",
      },
      {
        title: "IO devices and latency",
        href: "https://planetscale.com/blog/io-devices-and-latency",
      },
      {
        title: "Postgres OLTP benchmarks",
        href: "https://benjdd.com/pg-oltp/",
      },
      {
        title: "How Agoda unified its data pipelines",
        href: "https://www.infoq.com/news/2026/01/agoda-unified-data-pipeline/",
      },
      {
        title: "Agoda financial metrics uptime",
        href: "https://medium.com/agoda-engineering/how-agoda-enhanced-the-uptime-and-consistency-of-financial-metrics-ef7d54c4e4f0",
      },
      {
        title: "B-trees and database indexes",
        href: "https://planetscale.com/blog/btrees-and-database-indexes",
      },
      {
        title: "Database transactions",
        href: "https://planetscale.com/blog/database-transactions",
      },
      {
        title: "Managing Postgres connections",
        href: "https://brandur.org/postgres-connections",
      },
      {
        title: "Solving the hot key problem",
        href: "https://ximedes.com/blog/solving-the-hot-key-problem",
      },
    ],
  },
  {
    title: "Infrastructure, observability and runtimes",
    links: [
      {
        title: "Tracing a memory leak in an LRU cache",
        href: "https://blog.openresty.com/en/xray-casestudy-lua-lru/",
      },
      { title: "OpenStatus", href: "https://www.openstatus.dev/" },
      { title: "Just use evlog", href: "https://www.justfuckinguseevlog.com/" },
      { title: "evlog", href: "https://www.evlog.dev/" },
      { title: "Workbench for BullMQ", href: "https://getworkbench.dev/" },
      {
        title: "A peek behind Colossus",
        href: "https://cloud.google.com/blog/products/storage-data-transfer/a-peek-behind-colossus-googles-file-system",
      },
      {
        title: "Brendan Gregg's blog",
        href: "https://www.brendangregg.com/blog/index.html",
      },
      { title: "Perfetto UI", href: "https://ui.perfetto.dev/#!/query" },
      {
        title: "AWS serverless topics",
        href: "https://builder.aws.com/learn/topics/serverless",
      },
      {
        title: "Kubernetes, what I wish I knew",
        href: "https://aws.plainenglish.io/kubernetes-still-feels-weird-what-i-wish-i-knew-sooner-dd61b90463db",
      },
      {
        title: "EC2 instances comparison",
        href: "https://instances.vantage.sh/",
      },
      { title: "Akamai blog", href: "https://www.akamai.com/blog" },
    ],
  },
  {
    title: "Distributed systems and computer science",
    links: [
      {
        title: "The TCP/IP Guide",
        href: "http://www.tcpipguide.com/free/t_toc.html",
      },
      {
        title: "Computer Networks: A Systems Approach",
        href: "https://book.systemsapproach.org/",
      },
      { title: "Putting the You in CPU", href: "https://cpu.land/" },
      {
        title: "Building Distributed Systems roadmap",
        href: "https://builddistributedsystem.com/roadmap",
      },
      {
        title: "A tale of four fuzzers",
        href: "https://tigerbeetle.com/blog/2025-11-28-tale-of-four-fuzzers/",
      },
      {
        title: "JGroups building blocks",
        href: "http://www.jgroups.org/blocks.html",
      },
      { title: "AO hyper parallel computer", href: "https://ao.arweave.net/" },
      {
        title: "Lumen JS runtime in Rust",
        href: "https://github.com/lucid-softworks/lumen",
      },
    ],
  },
  {
    title: "Books and fundamentals",
    links: [
      {
        title: "Crafting Interpreters",
        href: "https://craftinginterpreters.com/",
      },
      {
        title: "Software Design by Example",
        href: "https://third-bit.com/sdxjs/",
      },
      {
        title: "Designing Data-Intensive Applications",
        href: "https://github.com/NirmalSilwal/system-design-resources/blob/master/Books/Designing%20Data%20Intensive%20Applications%20-%20Martin%20Kleppmann.pdf",
      },
      {
        title: "Can Programming Be Liberated (Backus)",
        href: "https://worrydream.com/refs/Backus_1978_-_Can_Programming_Be_Liberated_from_the_von_Neumann_Style.pdf",
      },
      { title: "The Joy of Elixir", href: "https://joyofelixir.com/" },
      {
        title: "Build your own X",
        href: "https://github.com/codecrafters-io/build-your-own-x",
      },
      {
        title: "System Design Primer",
        href: "https://github.com/donnemartin/system-design-primer",
      },
      { title: "Big-O visualized", href: "https://samwho.dev/big-o" },
    ],
  },
  {
    title: "Courses and learning paths",
    links: [
      {
        title: "Tech Interview Handbook",
        href: "https://www.techinterviewhandbook.org/software-engineering-interview-guide/",
      },
      {
        title: "Frontend Masters courses",
        href: "https://frontendmasters.com/courses/",
      },
      {
        title: "Frontend.fyi courses",
        href: "https://www.frontend.fyi/courses",
      },
      {
        title: "Effective Software courses",
        href: "https://www.effective.software/courses",
      },
      {
        title: "Database School Convex course",
        href: "https://databaseschool.com/series/convex/videos/359",
      },
      {
        title: "HTML and CSS for absolute beginners",
        href: "https://www.youtube.com/playlist?list=PL4-IK0AVhVjOJs_UjdQeyEZ_cmEV3uJvx",
      },
      {
        title:
          "Digital Design and Computer Architecture (Spring 2026 livestream)",
        href: "https://www.youtube.com/playlist?list=PL5Q2soXY2Zi-yo9kK-BKrq11ykNKkVEpd",
      },
    ],
  },
  {
    title: "Coding challenges and practice",
    links: [
      {
        title: "Build your own load tester",
        href: "https://codingchallenges.fyi/challenges/challenge-load-tester",
      },
      { title: "One Billion Row Challenge", href: "https://1brc.dev/" },
      {
        title: "One Trillion Row Challenge",
        href: "https://docs.coiled.io/blog/1trc.html",
      },
    ],
  },
  {
    title: "Developer tools and utilities",
    links: [
      { title: "Firecrawl", href: "https://www.firecrawl.dev/" },
      { title: "asccli", href: "https://asccli.sh/" },
      {
        title: "Better-T Stack",
        href: "https://better-t-stack.dev/new?fe-w=next&rt=node&pm=pnpm&ex=todo",
      },
      { title: "Comark", href: "https://comark.dev/" },
      { title: "DevTool Lab", href: "https://devtoollab.com/tools" },
      { title: "Digger", href: "https://digger.tools/" },
      {
        title: "Dev Resources API building",
        href: "https://devresourc.es/category/api-building",
      },
      { title: "DrawDB", href: "https://www.drawdb.app/editor" },
      { title: "Emulate", href: "https://emulate.dev/" },
      { title: "Electrobun", href: "https://blackboard.sh/blog/electrobun-v1" },
      {
        title: "Graphite changelog",
        href: "https://graphite.dev/blog?category=changelog",
      },
      { title: "IT Tools", href: "https://it-tools.tech/" },
      { title: "Namae", href: "https://namae.dev/s/Blankershot" },
      { title: "nuqs", href: "https://www.npmjs.com/package/nuqs" },
      { title: "Timezones Digital", href: "https://www.timezones.digital/" },
      { title: "TypeDoc", href: "https://github.com/TypeStrong/typedoc" },
      { title: "wterm", href: "https://wterm.dev/" },
      { title: "WTF terminal dashboard", href: "https://wtfutil.com/" },
      { title: "xmcp", href: "https://xmcp.dev/docs" },
      { title: "yt-dlp", href: "https://github.com/yt-dlp/yt-dlp" },
      { title: "Mafs", href: "https://mafs.dev/" },
      { title: "Affine", href: "https://affine.pro/" },
      { title: "useSend", href: "https://usesend.com/" },
      { title: "Documenso docs", href: "https://docs.documenso.com/" },
      { title: "listmonk", href: "https://listmonk.app/" },
      { title: "AffiliateOtter", href: "https://www.affiliateotter.com/" },
      { title: "OSINT4ALL", href: "https://start.me/p/L1rEYQ/osint4all" },
      { title: "Vercel Community", href: "https://community.vercel.com/" },
      {
        title: "Hucre spreadsheet",
        href: "https://github.com/productdevbook/hucre",
      },
      { title: "Unlighthouse", href: "https://unlighthouse.dev/" },
      { title: "OSS Perks", href: "https://www.ossperks.com/" },
      { title: "Vercel Doctor", href: "https://www.vercel-doctor.com/" },
      {
        title: "visual-diff",
        href: "https://github.com/acoyfellow/visual-diff",
      },
    ],
  },
  {
    title: "Effect ecosystem",
    links: [
      {
        title: "Visual Effect playground",
        href: "https://effect.kitlangton.com/",
      },
      { title: "Effect", href: "https://effect-ts.github.io/effect/" },
      {
        title: "Effect runtime visualizer",
        href: "https://effect-viz.vercel.app/",
      },
      { title: "Effect Solutions", href: "https://www.effect.solutions/" },
      {
        title: "Effect to JS examples",
        href: "https://github.com/bmdavis419/effect-to-js-ex",
      },
      {
        title: "Effect API example",
        href: "https://github.com/TeamWarp/effect-api-example/blob/main/packages/typescript-config/base.json",
      },
      {
        title: "Effect client wrapper skill",
        href: "https://skills.sh/rhyssullivan/effect-client-wrapper-skill/effect-client-wrapper",
      },
    ],
  },
  {
    title: "Docs, slides and content tools",
    links: [
      { title: "Tahta for Slidev", href: "https://tahta.cagdas.io/" },
      { title: "Reveal.js", href: "https://revealjs.com/#/20" },
      { title: "Slidev", href: "https://sli.dev/" },
    ],
  },
  {
    title: "Personal blogs and sites",
    links: [
      { title: "Joel on Software", href: "https://www.joelonsoftware.com/" },
      { title: "Making Software", href: "https://www.makingsoftware.com/" },
      { title: "Effective Software", href: "https://www.effective.software/" },
      { title: "I Hate Reading", href: "https://ihatereading.in/" },
      { title: "Evan Bacon", href: "https://evanbacon.dev/" },
      { title: "TK", href: "https://www.iamtk.co/" },
      { title: "Jacob Paris", href: "https://www.jacobparis.com/content" },
      { title: "Marvin Hagemeister", href: "https://marvinh.dev/" },
      { title: "mcyoung", href: "https://mcyoung.xyz/" },
      { title: "Chris Lattner", href: "https://nondot.org/sabre/" },
      { title: "Jordan Scales", href: "https://notes.jordanscales.com/" },
      { title: "pixperk", href: "https://www.pixperk.tech/blog" },
      { title: "Zoltan Kochan", href: "https://www.kochan.io/" },
      { title: "Cassidoo", href: "https://github.com/cassidoo" },
      { title: "mrncstt", href: "https://github.com/mrncstt" },
      { title: "cosmeratech", href: "https://github.com/cosmeratech" },
      {
        title: "Site Mini thoughts",
        href: "https://site-mini.vercel.app/thoughts",
      },
      {
        title: "Abhi on X",
        href: "https://x.com/abh1a0/status/1993033150323392720",
      },
      { title: "iximiuz on X", href: "https://x.com/iximiuz" },
      { title: "Eli Rousso", href: "https://www.elirousso.com/" },
    ],
  },
  {
    title: "Engineering essays and culture",
    links: [
      {
        title: "Three ways to solve problems",
        href: "https://andreasfragner.com/writing/three-ways-to-solve-problems",
      },
      {
        title: "The campfire no agent can replicate",
        href: "https://connect.mux.com/the-campfire-no-agent-can-replicate",
      },
      {
        title: "Dark Matter Developers",
        href: "https://www.hanselman.com/blog/dark-matter-developers-the-unseen-99",
      },
      {
        title: "Building another blog engine",
        href: "https://jt.lol/posts/building-another-blog-engine",
      },
      {
        title: "The end of productivity theater",
        href: "https://muratbuffalo.blogspot.com/2026/02/end-of-productivity-theater.html",
      },
      {
        title: "How to be 10x more productive",
        href: "https://newsletter.techworld-with-milan.com/p/how-to-be-10x-more-productive",
      },
      {
        title: "The making of a JPEG",
        href: "https://www.sophielwang.com/blog/jpeg",
      },
      {
        title: "How Margaret Hamilton landed NASA on the moon",
        href: "https://allthatsinteresting.com/margaret-hamilton",
      },
    ],
  },
  {
    title: "Talks, videos and channels",
    links: [
      { title: "CodeTV", href: "https://www.youtube.com/@codetv-dev/videos" },
      {
        title: "Deep Learning with Yacine",
        href: "https://www.youtube.com/@deeplearningexplained",
      },
      {
        title: "Developer Voices",
        href: "https://www.youtube.com/@DeveloperVoices",
      },
      {
        title: "Learn That Stack",
        href: "https://www.youtube.com/@LearnThatStack",
      },
      {
        title: "Performance Observer",
        href: "https://www.youtube.com/@PerformanceObserver/videos",
      },
      { title: "Lydia Hallie", href: "https://www.youtube.com/@theavocoder" },
      {
        title: "Handmade Network podcast",
        href: "https://handmade.network/podcast",
      },
      {
        title: "John Hammond",
        href: "https://www.youtube.com/@_JohnHammond",
      },
      {
        title: "Andrej Karpathy",
        href: "https://www.youtube.com/@AndrejKarpathy",
      },
      {
        title: "Yannic Kilcher",
        href: "https://www.youtube.com/@YannicKilcher",
      },
      { title: "The Net Ninja", href: "https://www.youtube.com/@NetNinja" },
      { title: "Corey Schafer", href: "https://www.youtube.com/@coreyms" },
      {
        title: "TechWorld with Nana",
        href: "https://www.youtube.com/@TechWorldwithNana",
      },
      {
        title: "AWS re:Invent",
        href: "https://www.youtube.com/playlist?list=PL2yQDdvlhXf_NqSnDKx7Hbb9FrNQKmxg7",
      },
      {
        title: "Luke Barousse",
        href: "https://www.youtube.com/@LukeBarousse",
      },
      { title: "Gaurav Sen", href: "https://www.youtube.com/@gkcs" },
      { title: "Hussein Nasser", href: "https://www.youtube.com/@hnasr" },
      { title: "The Cherno", href: "https://www.youtube.com/@TheCherno" },
      {
        title: "Learn Linux TV",
        href: "https://www.youtube.com/@LearnLinuxTV",
      },
      { title: "David Bombal", href: "https://www.youtube.com/@davidbombal" },
      { title: "3Blue1Brown", href: "https://www.youtube.com/@3blue1brown" },
      {
        title: "The DevOps roadmap that got me hired",
        href: "https://youtu.be/8s0DWeHuEaw",
      },
      {
        title: "The co-creator of Kubernetes",
        href: "https://youtu.be/FKijpCEH9D8",
      },
      {
        title: "React for Two Computers, Dan Abramov",
        href: "https://youtu.be/ozI4V_29fj4",
      },
      {
        title: "Live streaming at world record scale",
        href: "https://youtu.be/qXJ3S3T3xJY",
      },
      {
        title: "The power of an interface for performance",
        href: "https://www.youtube.com/watch?v=yKgfk8lTQuE&t=2929s",
      },
      {
        title: "Interactive 3D on the web",
        href: "https://www.youtube.com/watch?v=6omuUOZcWL0&list=PPSV",
      },
    ],
  },
  {
    title: "SEO",
    links: [{ title: "Seolo blog", href: "https://www.seolo.live/blogs" }],
  },
  {
    title: "Design tools and components",
    links: [
      {
        title: "Design Surface Cascade",
        href: "https://designsurface.dev/cascade",
        description: "Generative layout and design system playground.",
      },
      {
        title: "FluidCAD",
        href: "https://fluidcad.io",
        description: "Browser-based parametric CAD for product design.",
      },
      {
        title: "VibeUI",
        href: "https://vibeui.online",
        description: "AI-generated UI component gallery.",
      },
      {
        title: "Playbit",
        href: "https://playbit.app",
        description: "Drag-and-drop app builder for makers.",
      },
      {
        title: "Pascal Editor",
        href: "https://editor.pascal.app",
        description: "Minimal code editor for quick prototypes.",
      },
      {
        title: "String",
        href: "https://string.com",
        description: "Lightweight writing and notes app.",
      },
      {
        title: "Rams.al",
        href: "https://www.rams.al",
        description: "Dieter Rams-inspired minimalist design studio.",
      },
      {
        title: "iPhone 15 Pro in-hand mockups",
        href: "https://pixelsurplus.com/collections/free-mockups/products/15-iphone-15-pro-in-hand-mockups",
        description: "Free in-hand iPhone 15 Pro mockup pack.",
      },
      {
        title: "Ship Studio",
        href: "https://www.ship.studio",
        description: "Product design studio portfolio.",
      },
      {
        title: "Palmier",
        href: "https://www.palmier.io",
        description: "Design and branding studio site.",
      },
      {
        title: "Line nav (chanhdai)",
        href: "https://chanhdai.com/components/line-nav",
        description: "Animated underline nav bar component.",
      },
      {
        title: "10 principles for fluid UI",
        href: "https://karlkoch.me/writing/10-principles-for-fluid-ui",
        description: "Essay on building UI that feels fluid.",
      },
      {
        title: "Good Microcopy",
        href: "https://goodmicrocopy.com",
        description: "Examples of great UX writing and microcopy.",
      },
      {
        title: "State of AI Design",
        href: "https://stateofaidesign.com",
        description: "Annual report on how AI is reshaping design work.",
      },
      {
        title: "Colorflow",
        href: "https://colorflow.ls.graphics",
        description: "Interactive gradient and color flow generator.",
      },
      {
        title: "Replacements.fyi",
        href: "https://replacements.fyi",
        description: "Open-source alternatives to popular paid SaaS tools.",
      },
      {
        title: "Quarkdown",
        href: "https://quarkdown.com",
        description: "Markdown that compiles into styled documents and slides.",
      },
      {
        title: "termcn",
        href: "https://www.termcn.dev",
        description: "shadcn, but terminal-themed components.",
      },
      {
        title: "Torph (lochie)",
        href: "https://torph.lochie.me",
        description: "Physics-based interactive web experiment.",
      },
      {
        title: "Fluid Functionalism",
        href: "https://www.fluidfunctionalism.com",
        description: "Animated component library with a tactile, fluid feel.",
      },
      {
        title: "Trophy UI",
        href: "https://ui.trophy.so",
        description: "Gamification and achievements UI kit.",
      },
      {
        title: "Grainrad",
        href: "https://grainrad.com",
        description: "Grain and noise texture generator for design.",
      },
      {
        title: "formscn",
        href: "https://formscn.space",
        description: "shadcn, but for forms.",
      },
      {
        title: "servercn",
        href: "https://servercn.vercel.app",
        description: "shadcn, but for server and infra status components.",
      },
      {
        title: "Viewport UI",
        href: "https://viewport-ui.design",
        description: "Responsive UI pattern reference.",
      },
      {
        title: "ui.live",
        href: "https://ui.live",
        description: "Live UI component playground.",
      },
      {
        title: "UIBits",
        href: "https://uibits.co",
        description: "Curated UI component snippets.",
      },
      {
        title: "Details Matter",
        href: "https://detailsmatter.framer.website",
        description: "Showcase of small, delightful UI details.",
      },
      {
        title: "Coverflow",
        href: "https://coverflow.ashishgogula.in",
        description: "Apple Coverflow interaction, recreated in CSS/JS.",
      },
      {
        title: "Shaders.com presets",
        href: "https://shaders.com/presets",
        description: "Ready-made WebGL shader presets.",
      },
      {
        title: "Blobsketch",
        href: "https://cpreid2.github.io/blobsketch",
        description: "Draw and export organic blob shapes.",
      },
      {
        title: "Tekdetek",
        href: "https://vikmil.com/tekdetek",
        description: "Experimental generative art tool.",
      },
      {
        title: "Meshic",
        href: "https://meshic.app",
        description: "Mesh gradient generator for design.",
      },
      {
        title: "TUI Studio",
        href: "https://tui.studio",
        description: "Terminal UI aesthetic design studio.",
      },
      {
        title: "The UX of AI",
        href: "https://www.shapeof.ai",
        description: "Patterns and case studies for designing AI products.",
      },
      {
        title: "LiveKit Agents UI",
        href: "https://livekit.com/products/agents-ui",
        description: "Prebuilt UI components for voice AI agents.",
      },
      {
        title: "Graphite.art",
        href: "https://graphite.art",
        description: "Free vector graphics editor in the browser.",
      },
      {
        title: "Smallbits",
        href: "https://smallbits.design",
        description: "Collection of small, reusable UI ideas.",
      },
      {
        title: "Flowkit UI",
        href: "https://flowkit-ui.vzkiss.com",
        description: "Component kit for flow and diagram builders.",
      },
      {
        title: "Satis UI",
        href: "https://satisui.xyz",
        description: "Minimal component library and design toolkit.",
      },
      {
        title: "getdesign.md",
        href: "https://getdesign.md",
        description: "Turns markdown into polished design docs.",
      },
      {
        title: "Graphify Labs",
        href: "https://graphifylabs.ai",
        description: "AI-powered chart and graphic generator.",
      },
      {
        title: "Design Research: By Womxn",
        href: "https://www.design-research.be/by-womxn",
        description: "Design research project centering women's perspectives.",
      },
      {
        title: "Sileo",
        href: "https://sileo.aaryan.design",
        description: "Personal design portfolio and experiments.",
      },
      {
        title: "ReUI patterns",
        href: "https://reui.io/patterns",
        description: "Full-page UI pattern examples built with shadcn.",
      },
      {
        title: "bundui",
        href: "https://bundui.io",
        description: "shadcn-based component and block library.",
      },
      {
        title: "shadcnstore",
        href: "https://shadcnstore.com",
        description: "Marketplace of shadcn/ui blocks and templates.",
      },
      {
        title: "Another Graphic",
        href: "https://anothergraphic.org",
        description: "Graphic design archive and inspiration.",
      },
      {
        title: "Pageflows: iOS",
        href: "https://pageflows.com/ios",
        description: "Recorded UX flows from real iOS apps.",
      },
      {
        title: "Screens Design",
        href: "https://screensdesign.com",
        description: "Mobile app screen design gallery.",
      },
      {
        title: "User Inyerface",
        href: "https://userinyerface.com",
        description:
          "Game that makes you fight the worst dark-pattern UI ever built.",
      },
      {
        title: "Nicely Done",
        href: "https://nicelydone.club",
        description: "Teardown reviews of well-designed products.",
      },
      {
        title: "Hoverstat.es",
        href: "https://www.hoverstat.es",
        description: "Curated gallery of standout portfolio sites.",
      },
      {
        title: "shadcnthemer",
        href: "https://shadcnthemer.com",
        description: "Visual theme editor for shadcn/ui.",
      },
      {
        title: "Joly UI",
        href: "https://www.jolyui.dev/docs/components",
        description: "React component library with a playful style.",
      },
      {
        title: "Goey Toast",
        href: "https://goey-toast.vercel.app",
        description: "Squishy, gooey toast notification component.",
      },
      {
        title: "React Table Craft",
        href: "https://react-table-craft.vercel.app",
        description: "Drag-and-drop table builder for React.",
      },
      {
        title: "Pencil",
        href: "https://www.pencil.dev",
        description: "Design tool for building UI with real code.",
      },
      {
        title: "Paper",
        href: "https://paper.design",
        description: "Infinite canvas design tool for teams.",
      },
      {
        title: "Easemaster",
        href: "https://easemaster.satisui.xyz",
        description: "Visual easing curve editor for animation.",
      },
      {
        title: "design.dev",
        href: "https://design.dev",
        description: "Design engineering resource hub.",
      },
      {
        title: "Styleframe",
        href: "https://www.styleframe.dev",
        description: "Type-safe CSS-in-JS styling library.",
      },
      {
        title: "0xdesign design-plugin",
        href: "https://github.com/0xdesign/design-plugin",
        description: "Figma plugin for design system automation.",
      },
      {
        title: "Assistant UI",
        href: "https://www.assistant-ui.com",
        description: "React component library for building AI chat interfaces.",
      },
      {
        title: "Ali Imam blocks",
        href: "https://aliimam.in/blocks",
        description: "Copy-paste Tailwind UI blocks.",
      },
      {
        title: "itshover",
        href: "https://www.itshover.com",
        description: "Gallery of creative hover effects.",
      },
      {
        title: "Button (lakshb)",
        href: "https://button.lakshb.dev",
        description: "Collection of animated button styles.",
      },
      {
        title: "Colorize",
        href: "https://colorize.design",
        description: "Color palette generator for designers.",
      },
      {
        title: "9ui",
        href: "https://www.9ui.dev",
        description: "Minimal shadcn-style component library.",
      },
      {
        title: "Cult UI: dynamic island",
        href: "https://www.cult-ui.com/docs/components/dynamic-island",
        description: "iOS Dynamic Island, recreated as a React component.",
      },
      {
        title: "Codepen: simeydotme",
        href: "https://codepen.io/simeydotme/pen/myVddQ0",
        description: "CodePen demo of a creative UI interaction.",
      },
      {
        title: "Cult UI: family button",
        href: "https://www.cult-ui.com/docs/components/family-button",
        description: "Expanding action button group component.",
      },
      {
        title: "Cult UI: mock browser window",
        href: "https://www.cult-ui.com/docs/components/mock-browser-window",
        description: "Fake browser chrome component for showcasing UI.",
      },
      {
        title: "Codepen: jh3y",
        href: "https://codepen.io/jh3y/pen/QwyYoVr",
        description: "CodePen demo by CSS animator jh3y.",
      },
      {
        title: "Clip Paths editor (ui-layouts)",
        href: "https://tools.ui-layouts.com/clip-paths#editor",
        description: "Visual CSS clip-path shape editor.",
      },
      {
        title: "Glass3D",
        href: "https://glass3d.dev",
        description: "3D glassmorphism effect generator.",
      },
      {
        title: "Somonoco",
        href: "https://somonoco.com",
        description: "Design studio and experiments site.",
      },
      {
        title: "ui-layouts",
        href: "https://www.ui-layouts.com",
        description: "Copy-paste animated Tailwind layout components.",
      },
      {
        title: "hookcn",
        href: "https://hookcn.ouassim.tech",
        description: "shadcn, but for React hooks.",
      },
      {
        title: "Colormoods",
        href: "https://colormoods.co",
        description: "Mood-based color palette generator.",
      },
      {
        title: "buttonyui",
        href: "https://buttonyui.com",
        description: "Library of animated button components.",
      },
      {
        title: "Wigggle UI widgets",
        href: "https://wigggle-ui.vercel.app/widgets",
        description: "Wobbly, playful widget component kit.",
      },
      {
        title: "shadcnui-blocks",
        href: "https://www.shadcnui-blocks.com/blocks",
        description: "Free shadcn/ui page section blocks.",
      },
      {
        title: "Typed.js demo",
        href: "https://mattboldt.com/demos/typed-js",
        description: "Classic typewriter text animation library, live demo.",
      },
      {
        title: "Craftwork: onfire",
        href: "https://onfire.craftwork.design",
        description: "Trending premium design assets on Craftwork.",
      },
      {
        title: "Playlists.design",
        href: "https://playlists.design",
        description: "Curated music playlists for designers to work to.",
      },
      {
        title: "Hey Designer",
        href: "https://heydesigner.com",
        description: "Design newsletter and resource roundup.",
      },
      {
        title: "UI Guideline components",
        href: "https://www.uiguideline.com/components",
        description: "Component-level UI guideline reference.",
      },
      {
        title: "Reactiive demos",
        href: "https://reactiive.io/demos",
        description: "Creative React animation demos.",
      },
      {
        title: "SpoilerJS",
        href: "https://spoilerjs.sh4jid.me",
        description: "Discord-style spoiler text blur component.",
      },
      {
        title: "Color Palette Pro",
        href: "https://colorpalette.pro",
        description: "Color palette generator and export tool.",
      },
      {
        title: "Schema Supply gallery",
        href: "https://www.schema.supply/gallery",
        description: "Gallery of structured schema/JSON-LD design examples.",
      },
      {
        title: "shadcnexamples: authentication",
        href: "https://shadcnexamples.com/authentication",
        description: "Full shadcn/ui authentication page example.",
      },
      {
        title: "21st.dev: location tag",
        href: "https://21st.dev/community/components/jatin-yadav05/location-tag/default",
        description: "Community-built location tag component.",
      },
      {
        title: "21st.dev: 3D folder",
        href: "https://21st.dev/community/components/jatin-yadav05/3d-folder/default",
        description: "Community-built 3D folder hover component.",
      },
      {
        title: "21st.dev: AI chat",
        href: "https://21st.dev/community/components/s/ai-chat",
        description: "Community-built AI chat interface component.",
      },
      {
        title: "kokonutui: AI voice",
        href: "https://kokonutui.com/docs/components/ai-voice",
        description: "Voice AI waveform component.",
      },
      {
        title: "21st.dev: agenticfleet",
        href: "https://21st.dev/community/agenticfleet",
        description: "Community components for AI agent dashboards.",
      },
      {
        title: "shadcnexamples: blog detail page",
        href: "https://shadcnexamples.com/blog-detail-page",
        description: "Full shadcn/ui blog post page example.",
      },
      {
        title: "ElevenLabs UI",
        href: "https://ui.elevenlabs.io",
        description: "Official ElevenLabs voice AI UI components.",
      },
      {
        title: "aethercss",
        href: "https://aethercss.lovable.app",
        description: "AI-generated CSS effects playground.",
      },
      {
        title: "Harmonizer (Evil Martians)",
        href: "https://harmonizer.evilmartians.com",
        description: "Generates harmonious color palettes from a base color.",
      },
      {
        title: "Charco design resources",
        href: "https://www.charco.design/design-resources-tools",
        description: "Curated list of design resources and tools.",
      },
      {
        title: "Trending Design",
        href: "https://trending.design",
        description: "Trending design inspiration feed.",
      },
      {
        title: "Design Beyond Barriers",
        href: "https://designbeyondbarriers.com",
        description: "Accessibility-focused design resource.",
      },
      {
        title: "Plate",
        href: "https://platejs.org",
        description: "Rich text editor framework for React, like Notion's.",
      },
      {
        title: "buouui",
        href: "https://buouui.com/docs",
        description: "Minimal shadcn-style component library.",
      },
      {
        title: "MynaUI",
        href: "https://mynaui.com",
        description: "Free, beautifully designed UI component library.",
      },
      {
        title: "21st.dev: moon chat",
        href: "https://21st.dev/community/components/ruixenui/ruixen-moon-chat/default",
        description: "Community-built AI chat widget with a moon theme.",
      },
      {
        title: "Skiper UI: skiper87",
        href: "https://skiper-ui.com/v1/skiper87",
        description: "Community drag-and-scroll interaction component.",
      },
      {
        title: "21st.dev: blog cards",
        href: "https://21st.dev/community/components/sumonadotwork/blog-cards/default",
        description: "Community-built blog card component.",
      },
      {
        title: "21st.dev: reading text reveal",
        href: "https://21st.dev/community/components/wisedev/reading-text-reveal/default",
        description: "Community-built scroll-triggered text reveal.",
      },
      {
        title: "Stack and Justify",
        href: "https://max-esnee.com/stack-and-justify",
        description: "CSS flexbox stacking and justification cheatsheet.",
      },
      {
        title: "The Good Line Height",
        href: "https://thegoodlineheight.com",
        description: "Guide to picking the right line height.",
      },
      {
        title: "Radix Colors",
        href: "https://www.radix-ui.com/colors",
        description: "Accessible, systematic color scale for UI design.",
      },
      {
        title: "Background generator (ibelick)",
        href: "https://bg.ibelick.com",
        description: "Generates CSS gradient and pattern backgrounds.",
      },
      {
        title: "Interfaces (rauno)",
        href: "https://interfaces.rauno.me",
        description: "Curated collection of great interface details.",
      },
      {
        title: "HyperUI",
        href: "https://www.hyperui.dev",
        description: "Free Tailwind CSS component library.",
      },
      {
        title: "21st.dev: retro button",
        href: "https://21st.dev/serafimcloud/button-retro/default",
        description: "Community-built retro-styled button component.",
      },
      {
        title: "Magic UI: highlighter",
        href: "https://magicui.design/docs/components/highlighter",
        description: "Animated text highlighter component.",
      },
      {
        title: "Lisse",
        href: "https://corne.rs",
        description:
          "Small JavaScript library that draws squircle corners, the same continuous curve Figma and iOS use. Ships bindings for React, Vue and Svelte plus a framework-agnostic core, with per-corner control, borders, and shadows included.",
      },
    ],
  },
  {
    title: "Fonts and type foundries",
    links: [
      {
        title: "Precise Type",
        href: "https://precise-type.com",
        description: "Precision typography and kerning tool.",
      },
      {
        title: "Fixelpont (Klotter)",
        href: "https://klotter.supply/fixelpont",
        description: "Pixel-inspired display typeface.",
      },
      {
        title: "A Mono (Klotter)",
        href: "https://klotter.supply/a-mono",
        description: "Clean, free monospace typeface.",
      },
      {
        title: "Thestral (xCicero)",
        href: "https://xcicero.esad-gv.net/page/thestral/index.php",
        description: "Experimental student-foundry display typeface.",
      },
      {
        title: "Bonbance (xCicero)",
        href: "https://xcicero.esad-gv.net/page/bonbance",
        description: "Experimental student-foundry display typeface.",
      },
      {
        title: "Caramel (xCicero)",
        href: "https://xcicero.esad-gv.net/page/caramel/index.php",
        description: "Experimental student-foundry display typeface.",
      },
      {
        title: "Typograph Studio",
        href: "https://typograph.studio",
        description: "Type design and typography studio.",
      },
      {
        title: "Fontastic",
        href: "https://fontastic.space",
        description: "Custom icon font builder.",
      },
      {
        title: "Republish font foundry",
        href: "https://republi.sh",
        description: "The first fully open-source font foundry.",
      },
      {
        title: "Fluid Type Scale",
        href: "https://www.fluid-type-scale.com",
        description: "Generates responsive fluid type scales with clamp().",
      },
      {
        title: "MyFFFonts",
        href: "https://myfffonts.accentgrave.net",
        description: "Free font foundry and type specimens.",
      },
      {
        title: "Letterbox",
        href: "https://www.letterbox.sh",
        description: "Typography and lettering design tool.",
      },
      {
        title: "Font Trio pairs",
        href: "https://www.fonttrio.xyz/pairs",
        description: "Curated three-font pairing suggestions.",
      },
      {
        title: "Maxibestof typefaces",
        href: "https://maxibestof.one/typefaces",
        description: "Free, high-quality independent typefaces.",
      },
      {
        title: "Fonts in Movies",
        href: "https://fontsinmovies.com",
        description: "Identifies fonts used in film posters and titles.",
      },
      {
        title: "Are.na: Type Type Type",
        href: "https://www.are.na/edwin-beauchamp/type-type-type-xvogvyjgxkq",
        description: "Curated Are.na channel of typography inspiration.",
      },
      {
        title: "Quarantine fonts",
        href: "https://github.com/jenskutilek/quarantine-fonts",
        description: "Fonts drawn during COVID lockdown, released open source.",
      },
      {
        title: "Terminal Grotesque (Velvetyne)",
        href: "https://velvetyne.fr/fonts/terminal-grotesque",
        description: "Free glitchy grotesque typeface.",
      },
      {
        title: "Ghouls pixel blackletter font",
        href: "https://pixelsurplus.com/products/ghouls-pixel-blackletter-display-font",
        description: "Free spooky pixel blackletter display font.",
      },
      {
        title: "Acrata (Tortilla)",
        href: "https://tortilla.studio/fonts/acrata",
        description: "Free geometric display typeface.",
      },
      {
        title: "Arbutus Slab",
        href: "https://fonts.google.com/specimen/Arbutus+Slab",
        description: "Free decorative slab serif from Google Fonts.",
      },
      {
        title: "Trueno",
        href: "https://fontlibrary.org/en/font/trueno",
        description: "Free geometric sans-serif typeface.",
      },
      {
        title: "Inclusive Sans",
        href: "https://www.oliviaking.com/inclusivesans/feature",
        description: "Free sans-serif designed for low-vision accessibility.",
      },
      {
        title: "Santello",
        href: "https://www.dafont.com/santello.font",
        description: "Free brush script display font.",
      },
      {
        title: "Edge Cutting",
        href: "https://www.dafont.com/edgecutting.font",
        description: "Free sharp-edged display font.",
      },
      {
        title: "Hoky30",
        href: "https://zelowtype.gumroad.com/l/zthoky/Hoky30",
        description: "Retro display font pack.",
      },
      {
        title: "Ta Fabricans",
        href: "https://www.dafont.com/ta-fabricans.font",
        description: "Free handcrafted display font.",
      },
      {
        title: "Monoblock (Pixel Surplus)",
        href: "https://pixelsurplus.com/collections/free-fonts/products/monoblock",
        description: "Free blocky pixel monospace font.",
      },
      {
        title: "GC Arbiter Mono Logic",
        href: "https://pixelsurplus.com/products/gc-arbiter-mono-logic-typeface",
        description: "Free logic-board-inspired mono typeface.",
      },
      {
        title: "WT Karsa Mono",
        href: "https://pixelsurplus.com/products/wt-karsa-mono-free-font",
        description: "Free monospace display font.",
      },
      {
        title: "TRT Interval Mono",
        href: "https://pixelsurplus.com/collections/free-fonts/products/trt-interval-mono-font",
        description: "Free monospace display font.",
      },
      {
        title: "Acro Mono Display",
        href: "https://pixelsurplus.com/collections/free-fonts/products/acro-mono-free-display-font",
        description: "Free monospace display font.",
      },
      {
        title: "Space Type Generator",
        href: "https://spacetypegenerator.com",
        description: "Generates space-themed lettering and logos.",
      },
      {
        title: "Open Sauce Fonts",
        href: "https://github.com/marcologous/Open-Sauce-Fonts",
        description: "Free, open-source grotesque sans typeface family.",
      },
      {
        title: "Plus Jakarta Sans",
        href: "https://github.com/tokotype/PlusJakartaSans",
        description: "Free geometric sans typeface family.",
      },
      {
        title: "Onest",
        href: "https://github.com/simpals/onest",
        description: "Free modern grotesque sans typeface.",
      },
      {
        title: "Aspekta",
        href: "https://github.com/ivodolenc/aspekta",
        description: "Free variable grotesque sans typeface.",
      },
      {
        title: "Urbanist",
        href: "https://github.com/coreyhu/Urbanist",
        description: "Free low-contrast geometric sans typeface.",
      },
      {
        title: "Albert Sans",
        href: "https://github.com/usted/Albert-Sans",
        description: "Free grotesque sans typeface family.",
      },
      {
        title: "Inter",
        href: "https://github.com/rsms/inter",
        description: "The default UI sans-serif, used almost everywhere.",
      },
      {
        title: "Geist Font",
        href: "https://github.com/vercel/geist-font",
        description: "Vercel's official sans and mono typeface.",
      },
      {
        title: "Hubot Sans",
        href: "https://github.com/github/hubot-sans",
        description: "GitHub's open-source display typeface.",
      },
      {
        title: "Mona Sans",
        href: "https://github.com/github/mona-sans",
        description: "GitHub's open-source variable sans typeface.",
      },
      {
        title: "Rethink Sans",
        href: "https://github.com/hans-thiessen/Rethink-Sans",
        description: "Free grotesque sans typeface.",
      },
      {
        title: "JetBrains Mono",
        href: "https://github.com/JetBrains/JetBrainsMono",
        description: "Popular monospace font built for reading code.",
      },
      {
        title: "Source Code Pro",
        href: "https://github.com/adobe-fonts/source-code-pro",
        description: "Adobe's open-source monospace coding font.",
      },
      {
        title: "Roboto",
        href: "https://github.com/googlefonts/roboto",
        description: "Google's default Android and Material typeface.",
      },
      {
        title: "Monaspace",
        href: "https://github.com/githubnext/monaspace",
        description: "GitHub's monospace superfamily for code.",
      },
      {
        title: "Colors and Fonts",
        href: "https://www.colorsandfonts.com",
        description: "Curated color and font pairing inspiration.",
      },
      {
        title: "Font Radar",
        href: "https://www.fontradar.com",
        description: "Discover trending and new typefaces.",
      },
      {
        title: "Font name checker",
        href: "https://namecheck.fontdata.com",
        description: "Checks if a font or product name is already taken.",
      },
      {
        title: "Type scale (hihayk)",
        href: "https://hihayk.github.io/scale",
        description: "Visual type scale ratio generator.",
      },
    ],
  },
  {
    title: "Indie tools and utilities",
    links: [
      {
        title: "opencli",
        href: "https://opencli.info",
        description: "Directory of open-source CLI tools.",
      },
      {
        title: "nubjs",
        href: "https://nubjs.com",
        description: "Lightweight JavaScript utility library.",
      },
      {
        title: "devl.dev",
        href: "https://www.devl.dev",
        description: "Developer tools and utilities hub.",
      },
      {
        title: "Flue Framework",
        href: "https://flueframework.com",
        description: "Lightweight web framework.",
      },
      {
        title: "Vercel Eve",
        href: "https://vercel.com/eve",
        description: "Vercel's internal AI agent project page.",
      },
      {
        title: "Bytes newsletter",
        href: "https://bytes.dev",
        description: "Twice-weekly JavaScript news newsletter.",
      },
      {
        title: "ssgoi",
        href: "https://ssgoi.dev",
        description: "Page transition library for single-page apps.",
      },
      {
        title: "Text Paint",
        href: "https://textpaint.com",
        description: "Draw pixel art using text characters.",
      },
      {
        title: "Video to ASCII (ezascii)",
        href: "https://ezascii.com/video-to-ascii",
        description: "Converts video into ASCII art.",
      },
      {
        title: "ASCII Art Club",
        href: "https://asciiart.club",
        description: "Community gallery of ASCII art.",
      },
      {
        title: "Video to ASCII (Melobytes)",
        href: "https://melobytes.com/en/app/video2ascii",
        description: "Converts video into ASCII art.",
      },
      {
        title: "Text Diagram",
        href: "https://weidagang.github.io/text-diagram",
        description: "Draws diagrams using plain text and ASCII.",
      },
      {
        title: "Graph::Easy online",
        href: "https://graph-easy.online",
        description: "Text-to-diagram graph renderer.",
      },
      {
        title: "Gravity UI icons",
        href: "https://github.com/gravity-ui/icons",
        description: "Open-source icon set from Yandex's Gravity UI.",
      },
      {
        title: "Spacebar Chat",
        href: "https://github.com/spacebarchat",
        description: "Open-source, Discord-compatible chat client and server.",
      },
      {
        title: "OpenTUI",
        href: "https://github.com/anomalyco/opentui",
        description: "Framework for building terminal UIs.",
      },
      {
        title: "convert (p2r3)",
        href: "https://github.com/p2r3/convert",
        description: "Simple file conversion CLI tool.",
      },
      {
        title: "Fallow Tools docs",
        href: "https://docs.fallow.tools",
        description: "Documentation for the Fallow developer tools suite.",
      },
      {
        title: "Arcjet",
        href: "https://arcjet.com",
        description: "Security as code: rate limiting, bot protection, WAF.",
      },
      {
        title: "tocn",
        href: "https://tocn.vercel.app",
        description: "shadcn, but for terminal-themed components.",
      },
      {
        title: "here.now",
        href: "https://here.now",
        description: "Instant static site hosting.",
      },
      {
        title: "Wiretext",
        href: "https://wiretext.app",
        description: "Send text and notes instantly via a link.",
      },
      {
        title: "Transfer.zip",
        href: "https://transfer.zip",
        description: "Send large files without needing an account.",
      },
      {
        title: "Sho0gle",
        href: "https://sho0gle.dev",
        description: "Quick file and text sharing tool.",
      },
      {
        title: "Best Alternatives",
        href: "https://bestalternatives.dev/en/alternatives",
        description: "Directory of open-source alternatives to paid SaaS.",
      },
      {
        title: "WinWinKit",
        href: "https://winwinkit.com",
        description: "In-app purchase and paywall SDK for indie apps.",
      },
      {
        title: "theSVG",
        href: "https://thesvg.org",
        description: "Free SVG icon and illustration resource.",
      },
      {
        title: "SVG Studio",
        href: "https://svgstudio.org",
        description: "Browser-based SVG editor.",
      },
      {
        title: "SurveyJS library",
        href: "https://github.com/surveyjs/survey-library",
        description: "Open-source JavaScript survey and form builder.",
      },
      {
        title: "Conductor",
        href: "https://www.conductor.build",
        description: "Visual backend and workflow builder.",
      },
      {
        title: "ties (raffomania)",
        href: "https://github.com/raffomania/ties",
        description: "CLI tool for managing symlinked dotfiles.",
      },
      {
        title: "airpipe",
        href: "https://github.com/sanyam-g/airpipe",
        description: "Lightweight data pipeline tool.",
      },
      {
        title: "html2rss",
        href: "https://github.com/html2rss/html2rss",
        description: "Turns any webpage into an RSS feed.",
      },
      {
        title: "getprojekt",
        href: "https://www.getprojekt.com",
        description: "Project management tool for freelancers.",
      },
      {
        title: "docmd",
        href: "https://docmd.io",
        description: "Turns markdown into a documentation site.",
      },
      {
        title: "ToolmateX",
        href: "https://toolmatex.com",
        description: "Directory of AI and developer tools.",
      },
      {
        title: "EmailMD",
        href: "https://www.emailmd.dev",
        description: "Write emails in markdown, get styled HTML.",
      },
      {
        title: "PNG to ICO",
        href: "https://png-to-ico.com",
        description: "Converts PNG images into ICO favicons.",
      },
      {
        title: "JSON for You",
        href: "https://json4u.com",
        description: "JSON formatter, viewer and validator.",
      },
      {
        title: "SVG Path Editor",
        href: "https://yqnn.github.io/svg-path-editor",
        description: "Visual editor for SVG path data.",
      },
      {
        title: "nomnoml",
        href: "https://nomnoml.com",
        description: "Draws UML diagrams from a simple text syntax.",
      },
      {
        title: "Azimutt",
        href: "https://azimutt.app",
        description: "Explore and document large, complex database schemas.",
      },
      {
        title: "Image Compress",
        href: "https://imgcompress.karimzouine.com",
        description: "Free browser-based image compressor.",
      },
      {
        title: "One Time Secret",
        href: "https://onetimesecret.com",
        description: "Share a secret that self-destructs after one view.",
      },
      {
        title: "Accept Markdown",
        href: "https://acceptmarkdown.com",
        description: "Renders markdown as a clean, shareable web page.",
      },
      {
        title: "Galaxybrain",
        href: "https://galaxybrain.com",
        description: "AI-powered brainstorming and idea tool.",
      },
      {
        title: "GitInspect",
        href: "https://www.gitinspect.com",
        description: "Visualizes and inspects Git repository history.",
      },
      {
        title: "Plunk",
        href: "https://www.useplunk.com",
        description: "Open-source email platform, alternative to SendGrid.",
      },
      {
        title: "opensrc (Vercel Labs)",
        href: "https://github.com/vercel-labs/opensrc",
        description:
          "Vercel Labs experiment for open-source contribution tooling.",
      },
      {
        title: "Hyperframes",
        href: "https://github.com/heygen-com/hyperframes",
        description: "AI-generated video frame and storyboard tool.",
      },
      {
        title: "Monosketch",
        href: "https://monosketch.io",
        description: "Draw ASCII and box diagrams in the browser.",
      },
      {
        title: "almostnode",
        href: "https://almostnode.dev",
        description: "Lightweight Node.js runtime alternative.",
      },
      {
        title: "Blueberry",
        href: "https://www.meetblueberry.com",
        description: "Personal productivity and note-taking app.",
      },
      {
        title: "Ultracite",
        href: "https://www.ultracite.ai",
        description: "Zero-config Biome preset for linting and formatting.",
      },
      {
        title: "Typesense",
        href: "https://typesense.org",
        description: "Fast, open-source, typo-tolerant search engine.",
      },
      {
        title: "Oneshot.zip",
        href: "https://oneshot.zip",
        description: "One-off file sharing tool.",
      },
      {
        title: "Lil Agents",
        href: "https://lilagents.xyz",
        description: "Lightweight AI agent framework.",
      },
      {
        title: "Feynman",
        href: "https://www.feynman.is",
        description: "AI tool for explaining concepts simply.",
      },
      {
        title: "Rivet Agent OS",
        href: "https://rivet.dev/agent-os",
        description: "Infrastructure and runtime for deploying AI agents.",
      },
      {
        title: "Supabase docs over SSH",
        href: "https://supabase.com/blog/supabase-docs-over-ssh",
        description: "Blog post on serving docs through an SSH terminal.",
      },
      {
        title: "OpenStatus registry",
        href: "https://www.openstatus.dev/registry",
        description: "Open-source registry of self-hosted status pages.",
      },
      {
        title: "LowEndBox",
        href: "https://lowendbox.com",
        description: "Deals and reviews for cheap VPS hosting.",
      },
      {
        title: "Agentation",
        href: "https://www.agentation.com",
        description: "Point at bugs, let AI fix them.",
      },
      {
        title: "aitmpl",
        href: "https://www.aitmpl.com",
        description: "Templates and boilerplates for AI projects.",
      },
      {
        title: "pi.dev",
        href: "https://pi.dev",
        description: "AI coding assistant and tool.",
      },
      {
        title: "gists.sh",
        href: "https://gists.sh",
        description: "Quick code snippet sharing tool.",
      },
      {
        title: "Baudbot",
        href: "https://baudbot.ai",
        description: "AI chatbot builder.",
      },
      {
        title: "Promptfoo",
        href: "https://www.promptfoo.dev",
        description: "Open-source tool for testing and evaluating LLM prompts.",
      },
      {
        title: "Design Prompts",
        href: "https://www.designprompts.dev",
        description: "Curated AI prompts for design work.",
      },
      {
        title: "itty.dev",
        href: "https://itty.dev",
        description: "Tiny, fast router for edge and serverless functions.",
      },
      {
        title: "JustGage",
        href: "https://toorshia.github.io/justgage",
        description: "Lightweight JavaScript gauge and dial chart library.",
      },
      {
        title: "Actors.dev",
        href: "https://actors.dev",
        description: "Platform for deploying autonomous AI agents.",
      },
      {
        title: "AgentCard",
        href: "https://agentcard.sh",
        description: "Standard for publishing AI agent capability cards.",
      },
      {
        title: "iocaihost",
        href: "https://iocaihost.com",
        description: "AI model hosting platform.",
      },
      {
        title: "entire.io",
        href: "https://entire.io",
        description: "All-in-one business and ops platform.",
      },
      {
        title: "Cloudflare Sandbox",
        href: "https://sandbox.cloudflare.com",
        description:
          "Runs untrusted code in isolated Cloudflare Workers sandboxes.",
      },
      {
        title: "Agents View",
        href: "https://www.agentsview.io",
        description: "Dashboard for monitoring AI agent activity.",
      },
      {
        title: "Sub-Agents Directory",
        href: "https://sub-agents.directory",
        description: "Directory of Claude Code sub-agents.",
      },
      {
        title: "Table Format Converter",
        href: "https://www.tableformatconverter.com",
        description: "Converts tables between CSV, Markdown, JSON and more.",
      },
      {
        title: "Chroma",
        href: "https://www.trychroma.com",
        description: "Open-source embedding database for AI apps.",
      },
      {
        title: "Convex",
        href: "https://www.convex.dev",
        description: "Reactive backend platform with a built-in database.",
      },
      {
        title: "Label Studio",
        href: "https://labelstud.io",
        description: "Open-source data labeling tool for machine learning.",
      },
      {
        title: "OpenPanel",
        href: "https://openpanel.dev",
        description: "Open-source, privacy-friendly web analytics.",
      },
      {
        title: "tunnl.gg",
        href: "https://tunnl.gg",
        description: "Exposes a local server to the internet.",
      },
      {
        title: "types.kitlangton.com",
        href: "https://types.kitlangton.com",
        description: "Visualizer for TypeScript type structures.",
      },
      {
        title: "Diffs",
        href: "https://diffs.com",
        description: "Compare and share text and code diffs.",
      },
      {
        title: "Sparkbites",
        href: "https://sparkbites.dev",
        description: "Bite-sized developer learning content.",
      },
      {
        title: "Autosend",
        href: "https://autosend.com",
        description: "Automated email sending platform.",
      },
      {
        title: "Cap.js",
        href: "https://capjs.js.org",
        description: "Lightweight, privacy-friendly CAPTCHA alternative.",
      },
      {
        title: "Invoice Builder",
        href: "https://github.com/piratuks/invoice-builder",
        description: "Open-source invoice generator.",
      },
      {
        title: "Gmail Cleaner",
        href: "https://gururagavendra.github.io/gmail-cleaner",
        description: "Browser tool for bulk-cleaning your Gmail inbox.",
      },
      {
        title: "Kanba",
        href: "https://www.kanba.co",
        description: "Kanban-style project management tool.",
      },
      {
        title: "Halftone Maker",
        href: "https://halftonemaker.com",
        description: "Turns images into halftone dot patterns.",
      },
      {
        title: "SVG Converter",
        href: "https://svgconverter.online",
        description: "Converts images to and from SVG format.",
      },
      {
        title: "Halftone (xoihazard)",
        href: "https://halftone.xoihazard.com",
        description: "Turns images into halftone dot patterns.",
      },
      {
        title: "Oklch.fyi",
        href: "https://oklch.fyi",
        description: "OKLCH color picker and converter.",
      },
      {
        title: "RSSHub docs",
        href: "https://docs.rsshub.app",
        description: "Docs for generating RSS feeds from almost any site.",
      },
      {
        title: "RxResume",
        href: "https://rxresu.me",
        description: "Free, open-source resume builder.",
      },
      {
        title: "Invoicely",
        href: "https://invoicely.gg",
        description: "Simple online invoicing tool.",
      },
      {
        title: "Documenso",
        href: "https://documenso.com",
        description: "Open-source alternative to DocuSign.",
      },
      {
        title: "Trigger.dev",
        href: "https://trigger.dev",
        description: "Open-source background jobs and workflow platform.",
      },
      {
        title: "Unosend",
        href: "https://www.unosend.co",
        description: "Transactional email sending service.",
      },
      {
        title: "Remote Storage",
        href: "https://remote.storage",
        description: "Decentralized personal data storage protocol.",
      },
      {
        title: "Domain Locker",
        href: "https://domain-locker.com",
        description: "Track and manage your domain portfolio.",
      },
      {
        title: "Typefully",
        href: "https://typefully.com",
        description: "Twitter/X thread writing and scheduling tool.",
      },
      {
        title: "Bento PDF",
        href: "https://bentopdf.com",
        description: "Free browser-based PDF editing tools.",
      },
      {
        title: "8mb",
        href: "https://8mb.campuscal.tech",
        description: "File compressor for hitting Discord's 8MB upload limit.",
      },
      {
        title: "Resume Matcher",
        href: "https://resumematcher.fyi",
        description: "Matches your resume against job descriptions with AI.",
      },
      {
        title: "Autumn",
        href: "https://useautumn.com",
        description: "Billing and subscription infrastructure for SaaS.",
      },
      {
        title: "Liquid Glass (shuding)",
        href: "https://github.com/shuding/liquid-glass",
        description: "CSS/JS recreation of Apple's Liquid Glass effect.",
      },
      {
        title: "Web Check",
        href: "https://web-check.xyz",
        description: "Runs a full OSINT and security check on any website.",
      },
      {
        title: "Freesound",
        href: "https://freesound.org",
        description: "Huge library of free, Creative Commons sound effects.",
      },
      {
        title: "Online-Convert",
        href: "https://www.online-convert.com",
        description: "Free online file format converter.",
      },
      {
        title: "MSW",
        href: "https://mswjs.io",
        description: "Mock Service Worker, API mocking library for tests.",
      },
      {
        title: "Media Cheatsheet",
        href: "https://mediacheatsheet.com",
        description: "Reference for common CSS media query breakpoints.",
      },
      {
        title: "NativeWind",
        href: "https://www.nativewind.dev",
        description: "Tailwind CSS for React Native.",
      },
      {
        title: "Learn X in Y Minutes",
        href: "https://learnxinyminutes.com",
        description: "Learn a programming language's syntax in minutes.",
      },
      {
        title: "Flukeout: CSS Diner",
        href: "https://flukeout.github.io",
        description: "Game for learning CSS selectors.",
      },
      {
        title: "Frontend Practice",
        href: "https://www.frontendpractice.com",
        description: "Practice building real UI from real designs.",
      },
      {
        title: "ui.dev",
        href: "https://ui.dev",
        description: "Frontend courses and tutorials, especially React.",
      },
    ],
  },
  {
    title: "Self-hosted software",
    links: [
      {
        title: "HeyForm",
        href: "https://github.com/heyform/heyform",
        description: "Open-source, self-hosted form builder.",
      },
      {
        title: "Gotify",
        href: "https://github.com/gotify",
        description: "Simple self-hosted push notification server.",
      },
      {
        title: "LimeSurvey",
        href: "https://github.com/LimeSurvey/LimeSurvey",
        description: "Open-source, self-hosted survey tool.",
      },
      {
        title: "Cachet",
        href: "https://github.com/cachethq/cachet",
        description: "Open-source status page system.",
      },
      {
        title: "Sessy (GitHub)",
        href: "https://github.com/marckohlbrugge/sessy",
        description: "Self-hosted 'do not disturb' session timer, source code.",
      },
      {
        title: "Sessy (app)",
        href: "https://sessy.do",
        description: "Self-hosted 'do not disturb' session timer, live app.",
      },
      {
        title: "Whoogle Search",
        href: "https://github.com/benbusby/whoogle-search",
        description: "Self-hosted, ad-free Google search proxy.",
      },
      {
        title: "Gitea",
        href: "https://about.gitea.com",
        description: "Lightweight, self-hosted Git service.",
      },
      {
        title: "Coolify",
        href: "https://coolify.io",
        description: "Open-source, self-hostable Vercel/Heroku alternative.",
      },
      {
        title: "Slash",
        href: "https://github.com/yourselfhosted/slash",
        description: "Self-hosted bookmark manager, alternative to Linktree.",
      },
      {
        title: "Docmost",
        href: "https://docmost.com",
        description: "Open-source, self-hosted Notion/Confluence alternative.",
      },
      {
        title: "Glance",
        href: "https://github.com/glanceapp/glance",
        description:
          "Self-hosted, customizable dashboard for widgets and feeds.",
      },
      {
        title: "Paymenter",
        href: "https://paymenter.org",
        description: "Open-source billing panel for hosting providers.",
      },
      {
        title: "Windmill",
        href: "https://www.windmill.dev",
        description: "Open-source workflow engine and internal tools builder.",
      },
      {
        title: "FileFlows",
        href: "https://fileflows.com",
        description: "Self-hosted media file processing automation.",
      },
      {
        title: "DocuSeal",
        href: "https://www.docuseal.com",
        description: "Open-source, self-hosted DocuSign alternative.",
      },
      {
        title: "Postiz",
        href: "https://postiz.com",
        description: "Open-source, self-hosted social media scheduler.",
      },
      {
        title: "Colanode",
        href: "https://colanode.com",
        description: "Local-first, open-source Notion alternative.",
      },
      {
        title: "Mazanoke",
        href: "https://mazanoke.com",
        description: "Self-hosted, fast image compressor.",
      },
      {
        title: "Cloudreve",
        href: "https://cloudreve.org",
        description: "Self-hosted cloud file storage system.",
      },
      {
        title: "Karakeep",
        href: "https://karakeep.app",
        description: "Self-hosted bookmark and read-it-later app.",
      },
      {
        title: "WriteFreely",
        href: "https://writefreely.org",
        description: "Minimalist, self-hosted blogging platform.",
      },
      {
        title: "YOURLS",
        href: "https://yourls.org",
        description: "Self-hosted URL shortener.",
      },
      {
        title: "MediaCMS",
        href: "https://mediacms.io",
        description:
          "Self-hosted, open-source video and media platform, like YouTube.",
      },
      {
        title: "pad.ws",
        href: "https://pad.ws",
        description: "Self-hostable infinite whiteboard, built on Excalidraw.",
      },
      {
        title: "OpenCut",
        href: "https://opencut.app",
        description: "Open-source, self-hostable video editor.",
      },
    ],
  },
  {
    title: "Mockups, textures and patterns",
    links: [
      {
        title: "MacBook mockup on wooden chair",
        href: "https://mockups-design.com/macbook-mockup-on-wooden-chair",
        description: "Free lifestyle MacBook mockup.",
      },
      {
        title: "MacBook Pro on folding chair",
        href: "https://unblast.com/macbook-pro-on-modern-folding-chair",
        description: "Free lifestyle MacBook Pro mockup.",
      },
      {
        title: "Ransom note letters",
        href: "https://resourceboy.com/graphics/ransom-note-letters",
        description: "Free cut-out ransom note letter graphics.",
      },
      {
        title: "Scribble textures",
        href: "https://resourceboy.com/textures/scribble-textures",
        description: "Free hand-drawn scribble texture pack.",
      },
      {
        title: "200 crayon Photoshop brushes",
        href: "https://unblast.com/200-crayon-photoshop-brushes",
        description: "Free crayon texture Photoshop brush set.",
      },
      {
        title: "Grunge brushes",
        href: "https://resourceboy.com/photoshop-brushes/grunge-brushes",
        description: "Free grunge texture Photoshop brush pack.",
      },
      {
        title: "UltraMock",
        href: "https://www.ultramock.io",
        description: "Device mockup generator.",
      },
      {
        title: "Resourceboy patterns",
        href: "https://resourceboy.com/patterns",
        description: "Free seamless pattern graphics.",
      },
      {
        title: "Heritage Type free vintage illustrations",
        href: "https://www.heritagetype.com/pages/free-vintage-illustrations",
        description: "Free vintage illustration pack.",
      },
      {
        title: "ls.graphics paaatterns",
        href: "https://www.ls.graphics/products/paaatterns",
        description: "Premium seamless pattern pack.",
      },
      {
        title: "Pattern Playground",
        href: "https://learn.every-tuesday.com/pattern-playground",
        description: "Interactive tool for generating seamless patterns.",
      },
      {
        title: "House of Mockups freebies",
        href: "https://houseofmockups.com/collections/freebies",
        description: "Free device and product mockup pack.",
      },
      {
        title: "Are.na: cool characters",
        href: "https://www.are.na/t-hanks/cool-characters",
        description: "Curated Are.na channel of character design inspiration.",
      },
      {
        title: "f1lemock",
        href: "https://f1lemock.com",
        description: "Free file and device mockup generator.",
      },
      {
        title: "Paliotta mockup",
        href: "https://paliotta.gumroad.com/l/zzumsc",
        description: "Premium product mockup pack.",
      },
      {
        title: "Architect mockup (Vitora)",
        href: "https://vitora.gumroad.com/l/architect-mockup",
        description: "Architectural presentation mockup pack.",
      },
      {
        title: "iPhone 17 mockup (Mockuply)",
        href: "https://mockuply.gumroad.com/1/iPhone17",
        description: "iPhone 17 device mockup pack.",
      },
    ],
  },
  {
    title: "Agent skills directories",
    links: [
      {
        title: "ui-skills.com",
        href: "https://www.ui-skills.com",
        description: "Directory of AI agent skills for UI and design work.",
      },
      {
        title: "Dimillian skills",
        href: "https://github.com/dimillian/skills",
        description: "Claude Code skills by iOS developer Dimillian.",
      },
      {
        title: "Fallow Tools: agent skills integration",
        href: "https://docs.fallow.tools/integrations/agent-skills",
        description: "Docs for integrating agent skills with Fallow Tools.",
      },
      {
        title: "shadcn skills docs",
        href: "https://ui.shadcn.com/docs/skills",
        description: "Official shadcn/ui docs for agent skills.",
      },
      {
        title: "kalypso-claude-workflow",
        href: "https://github.com/Kalypsokichu-code/kalypso-claude-workflow",
        description:
          "Claude Code workflow config, origin of the 'Kalypso' name.",
      },
      {
        title: "Marketing skills",
        href: "https://github.com/coreyhaines31/marketingskills",
        description: "Claude Code skills for marketing tasks.",
      },
      {
        title: "skills.sh",
        href: "https://skills.sh",
        description: "Directory of installable Claude Code agent skills.",
      },
      {
        title: "Vercel composition patterns skill",
        href: "https://skills.sh/vercel-labs/agent-skills/vercel-composition-patterns",
        description: "Agent skill for Vercel's component composition patterns.",
      },
      {
        title: "Web design guidelines skill",
        href: "https://skills.sh/vercel-labs/agent-skills/web-design-guidelines",
        description: "Agent skill for web design best practices.",
      },
    ],
  },
  {
    title: "Animated icon libraries",
    links: [
      {
        title: "Lucide Animated",
        href: "https://lucide-animated.com",
        description: "Animated versions of Lucide icons.",
      },
      {
        title: "Eva Icons",
        href: "https://akveo.github.io/eva-icons",
        description: "Free, open-source icon pack with animation support.",
      },
      {
        title: "Moving Icons",
        href: "https://www.movingicons.dev",
        description: "Library of animated icon components.",
      },
      {
        title: "useAnimations",
        href: "https://useanimations.com",
        description: "Free animated icon library based on Lottie.",
      },
      {
        title: "Blendy",
        href: "https://blendy.tahazsh.com",
        description: "Library for morphing shapes from one icon into another.",
      },
      {
        title: "Animate Icons",
        href: "https://animateicons.vercel.app",
        description: "Collection of animated icon components for React.",
      },
      {
        title: "Lineicons",
        href: "https://lineicons.com",
        description: "Free line-style icon pack.",
      },
    ],
  },
  {
    title: "VPS and hosting videos",
    links: [
      {
        title: "Next.js hosting: Coolify, VPS, self-hosting",
        href: "https://www.youtube.com/watch?v=pk0DypMIZfM",
        description: "Video comparing self-hosted Next.js hosting options.",
      },
      {
        title: "VPS hosting explainer",
        href: "https://www.youtube.com/watch?v=4guOChx7poQ",
        description: "Video explaining what VPS hosting is.",
      },
      {
        title: "Should you use a VPS instead of Vercel, Netlify & co?",
        href: "https://www.youtube.com/watch?v=yVuyh95kqXk",
        description: "Video weighing VPS hosting against managed platforms.",
      },
      {
        title: "What is a VPS, everything you need to know",
        href: "https://www.youtube.com/watch?v=4zZiFTQoXRM",
        description: "Beginner-friendly VPS explainer video.",
      },
      {
        title: "Best value VPS provider: price to performance",
        href: "https://www.youtube.com/watch?v=FZRBw-_s8i0",
        description: "Video comparing VPS providers by price and performance.",
      },
    ],
  },
  {
    title: "SwiftUI",
    links: [
      {
        title: "SwiftUI Microinteractions",
        href: "https://github.com/iamvishal16/swiftui-microinteractions",
        description:
          "SwiftUI library of polished micro-interaction components.",
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
