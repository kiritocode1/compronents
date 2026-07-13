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
        title: "Cascade (Design Surface)",
        href: "https://designsurface.dev/cascade",
        description:
          "Set of visual icons representing individual CSS properties, giving styling attributes a graphical reference instead of plain text names.",
      },
      {
        title: "FluidCAD",
        href: "https://fluidcad.io",
        description:
          "Parametric CAD tool where you write JavaScript and see 3D geometry update live. Supports sketching, extrusions and fillets, STEP import/export, and keeps a parametric history so earlier steps stay editable.",
      },
      {
        title: "VibeUI",
        href: "https://vibeui.online",
        description:
          "Library of 92 layout prompts across 15 categories (auth forms, pricing pages, hero sections, dashboards) meant to be copy-pasted into an AI coding tool like Claude or GPT to scaffold a UI.",
      },
      {
        title: "Playbit",
        href: "https://playbit.app",
        description:
          "Platform for building 'joyful personal-scale software' once and running it across desktop, web and mobile without a full rebuild. Its runtime acts like a minimal OS kernel, adding sandboxing and collaborative features that don't fit well in a plain browser tab.",
      },
      {
        title: "Pascal Editor",
        href: "https://editor.pascal.app",
        description:
          "Free, open-source, browser-based 3D building editor for turning physical spaces into digital twins, aimed at architects, developers and homeowners alike.",
      },
      {
        title: "String",
        href: "https://string.com",
        description:
          "Platform for building and deploying AI agents that can operate autonomously.",
      },
      {
        title: "Rams.al",
        href: "https://www.rams.al",
        description:
          "Personal design site named for Dieter Rams; didn't resolve on the last check, likely a minimalist portfolio judging by the name.",
      },
      {
        title: "iPhone 15 Pro in-hand mockups",
        href: "https://pixelsurplus.com/collections/free-mockups/products/15-iphone-15-pro-in-hand-mockups",
        description:
          "Free pack of in-hand iPhone 15 Pro mockup shots for presenting app screens in a realistic, held-in-hand context.",
      },
      {
        title: "Ship Studio",
        href: "https://www.ship.studio",
        description:
          "Free, open-source desktop app that unifies AI coding agents (like Claude Code), GitHub and hosting platforms (like Vercel) into one workspace, so code and deploys stay in your own accounts with no vendor lock-in.",
      },
      {
        title: "Palmier",
        href: "https://www.palmier.io",
        description:
          "AI-native video editor: multi-track timeline editing plus the ability to generate images, video and audio inline via MCP-connected models like Claude, so AI generation and traditional editing live in one interface.",
      },
      {
        title: "Line nav (chanhdai)",
        href: "https://chanhdai.com/components/line-nav",
        description:
          "Animated underline nav bar component from chanhdai's component collection, where the underline slides and morphs between tabs.",
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
        title: "Colorflow",
        href: "https://colorflow.ls.graphics",
        description:
          "Interactive tool from LS.GRAPHICS for generating and animating smooth, flowing gradient combinations for use in design work.",
      },
      {
        title: "Replacements.fyi",
        href: "https://replacements.fyi",
        description:
          "Directory pairing popular paid SaaS products with open-source, self-hostable alternatives that do roughly the same job.",
      },
      {
        title: "Quarkdown",
        href: "https://quarkdown.com",
        description:
          "Markdown superset that compiles into fully styled documents, books and slide decks, adding layout and theming on top of plain markdown syntax.",
      },
      {
        title: "termcn",
        href: "https://www.termcn.dev",
        description:
          "shadcn, but for terminal-themed UI components, copy-paste pieces styled to look like a terminal window.",
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
        title: "Grainrad",
        href: "https://grainrad.com",
        description:
          "Grain and noise texture generator for adding film-grain-style texture to designs.",
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
        title: "Coverflow",
        href: "https://coverflow.ashishgogula.in",
        description:
          "Recreation of Apple's classic Coverflow browsing interaction in CSS and JS, a reference for building similar carousel-style pickers.",
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
        title: "TUI Studio",
        href: "https://tui.studio",
        description:
          "Figma-like visual editor for designing terminal UIs with drag-and-drop components, targeting code export to frameworks like Ink, BubbleTea, Blessed and Textual (in alpha).",
      },
      {
        title: "The UX of AI",
        href: "https://www.shapeof.ai",
        description:
          "Reference library of interaction patterns and case studies specifically for designing AI product features, from chat to agentic flows.",
      },
      {
        title: "LiveKit Agents UI",
        href: "https://livekit.com/products/agents-ui",
        description:
          "Prebuilt UI components from LiveKit for building voice AI agent interfaces: waveforms, transcripts and call controls out of the box.",
      },
      {
        title: "Graphite.art",
        href: "https://graphite.art",
        description:
          "Free, open-source vector and raster graphics editor that runs in the browser, aiming to be a serious Illustrator/Photoshop-style alternative.",
      },
      {
        title: "Smallbits",
        href: "https://smallbits.design",
        description:
          "Set of 290+ pixel icons constrained to an 8x8 grid, by Minor Adventures, minimalist icon design where every pixel counts.",
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
        title: "getdesign.md",
        href: "https://getdesign.md",
        description:
          "Turns a markdown file into a polished, styled design document, useful for spec docs and design write-ups that shouldn't look like plain markdown.",
      },
      {
        title: "Graphify",
        href: "https://graphifylabs.ai",
        description:
          "Open-source tool that converts a codebase into a knowledge graph AI coding assistants can query, returning explicit graph paths with real file:line citations instead of vague embedding matches. Runs entirely on-device, no account or API key needed.",
      },
      {
        title: "Design Research: By Womxn",
        href: "https://www.design-research.be/by-womxn",
        description:
          "Design research project centering women's perspectives and experiences in how design research gets done.",
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
        title: "shadcnthemer",
        href: "https://shadcnthemer.com",
        description:
          "Visual theme editor for shadcn/ui: tweak colors, radius and spacing live and export the resulting theme config.",
      },
      {
        title: "Joly UI",
        href: "https://www.jolyui.dev/docs/components",
        description:
          "50+ free shadcn/ui components for React and Next.js, copy-paste ready, combining accessibility with Framer Motion and WebGL-driven animation across buttons, text effects, inputs and navigation.",
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
        title: "Easemaster",
        href: "https://easemaster.satisui.xyz",
        description:
          "Visual easing curve editor for animation, for dialing in a custom cubic-bezier by eye instead of guessing numbers.",
      },
      {
        title: "design.dev",
        href: "https://design.dev",
        description:
          "Resource hub of code generators, cheat sheets and AI-powered tools for generating design systems and config files, plus a weekly front-end tools newsletter.",
      },
      {
        title: "Styleframe",
        href: "https://www.styleframe.dev",
        description:
          "TypeScript library for writing type-safe, composable CSS for design systems. Generates CSS at build time for performance, with optional runtime styling, and works with React, Vue or Astro.",
      },
      {
        title: "0xdesign design-plugin",
        href: "https://github.com/0xdesign/design-plugin",
        description:
          "Claude Code plugin that iterates on UI design: generates multiple distinct component variations, lets you compare them side by side in the browser, and refines based on feedback, producing production-ready code (not mockups) for Next.js, Vite or Remix with Tailwind or Material UI.",
      },
      {
        title: "Assistant UI",
        href: "https://www.assistant-ui.com",
        description:
          "React component library specifically for building AI chat interfaces: message streams, tool-call rendering and input handling out of the box.",
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
        title: "Colorize",
        href: "https://colorize.design",
        description:
          "Color palette generator aimed at designers picking cohesive color sets for a project.",
      },
      {
        title: "9ui",
        href: "https://www.9ui.dev",
        description:
          "Minimal shadcn-style component library with a pared-back visual style.",
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
        title: "Colormoods",
        href: "https://colormoods.co",
        description:
          "Generates pairs of colors along a 0-100 'stimulation' scale, weighing intensity, contrast, hue separation and vibration to suggest combinations that read as calm or energetic.",
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
        title: "shadcnui-blocks",
        href: "https://www.shadcnui-blocks.com/blocks",
        description:
          "Free shadcn/ui page section blocks for assembling landing pages without building every section from scratch.",
      },
      {
        title: "Typed.js demo",
        href: "https://mattboldt.com/demos/typed-js",
        description:
          "Live demo of Typed.js, the long-running classic library for typewriter-style text animation on the web.",
      },
      {
        title: "Craftwork: onfire",
        href: "https://onfire.craftwork.design",
        description:
          "Trending premium design assets currently popular on Craftwork's marketplace.",
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
      {
        title: "UI Guideline components",
        href: "https://www.uiguideline.com/components",
        description:
          "Database compiling best practices from the top 20 design systems and UI libraries into one component-by-component reference, from buttons to data tables, with Figma kits included.",
      },
      {
        title: "Reactiive demos",
        href: "https://reactiive.io/demos",
        description:
          "Gallery of creative React animation demos for interaction and motion inspiration.",
      },
      {
        title: "SpoilerJS",
        href: "https://spoilerjs.sh4jid.me",
        description:
          "Discord-style spoiler text component that blurs text until clicked or hovered to reveal it.",
      },
      {
        title: "Color Palette Pro",
        href: "https://colorpalette.pro",
        description:
          "Color palette generator and export tool for building and downloading cohesive color sets.",
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
        title: "ElevenLabs UI",
        href: "https://ui.elevenlabs.io",
        description:
          "Official component library from ElevenLabs for building voice AI interfaces, matching the components they use in their own products.",
      },
      {
        title: "aethercss",
        href: "https://aethercss.lovable.app",
        description:
          "Free generator for Liquid Glass, Glassmorphism and Neumorphism CSS effects with a live preview: adjust sliders and colors and copy the generated code. Works best in Chromium browsers.",
      },
      {
        title: "Harmonizer (Evil Martians)",
        href: "https://harmonizer.evilmartians.com",
        description:
          "Tool from Evil Martians that generates a harmonious color palette from a single base color, useful for quickly extending a brand color into a full UI palette.",
      },
      {
        title: "Trending Design",
        href: "https://trending.design",
        description:
          "Curated marketplace recommending products for creative professionals across three categories: design tech (devices and tools), design books and design documentaries, each with independent reviews.",
      },
      {
        title: "Design Beyond Barriers",
        href: "https://designbeyondbarriers.com",
        description:
          "Accessibility guide written by designers for designers: 30 articles covering typography, color, form design and testing, arguing accessibility is a design decision, not just a developer checklist.",
      },
      {
        title: "Plate",
        href: "https://platejs.org",
        description:
          "Rich text editor framework for React, the kind of building blocks behind Notion-style editors, with a plugin system for extending it rather than building a WYSIWYG editor from scratch.",
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
        title: "Interfaces (rauno)",
        href: "https://interfaces.rauno.me",
        description:
          "Rauno Freiberg's curated collection of great interface details, screenshots of specific, well-executed UI moments from real products.",
      },
      {
        title: "HyperUI",
        href: "https://www.hyperui.dev",
        description:
          "Free, open-source Tailwind CSS component library with a large catalog of marketing and application UI sections to copy and paste.",
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
        description:
          "Web tool for building harmonious type scales from musical-interval ratios like Major Third or Perfect Fifth. Exports implementation-ready CSS and CSV, and its 'Line Grid' constraint rounds line heights to pixel multiples for pixel-perfect alignment.",
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
        title: "Republish font foundry",
        href: "https://republi.sh",
        description:
          "Self-initiated project by Behalf Studio that turns Vietnamese vernacular lettering (hand-painted shop signs, concrete building numerals, archival ephemera) into free, open-source digital typefaces, returned to the community they came from.",
      },
      {
        title: "Fluid Type Scale",
        href: "https://www.fluid-type-scale.com",
        description:
          "Generates a responsive fluid type scale using CSS clamp(), so font sizes scale smoothly between a minimum and maximum viewport instead of jumping at breakpoints.",
      },
      {
        title: "MyFFFonts",
        href: "https://myfffonts.accentgrave.net",
        description:
          "Curated library of free, open-source typefaces spanning sans, monospace, display and variable fonts, with designer credit and licensing info attached to each.",
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
        title: "Space Type Generator",
        href: "https://spacetypegenerator.com",
        description:
          "Kinetic type generator with over 20 animation modes (Cylinder, Field, Stripes, Coil and more) for rendering moving, space-themed typography in real time.",
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
    title: "Indie tools and utilities",
    links: [
      {
        title: "opencli",
        href: "https://opencli.info",
        description:
          "Gives a command-line interface or AI agent control of an already-logged-in browser session, so an agent can act on sites you're authenticated into instead of needing separate credentials.",
      },
      {
        title: "nubjs",
        href: "https://nubjs.com",
        description:
          "All-in-one Node.js toolkit shipped as a single Rust binary: runs TypeScript directly, manages packages and Node versions, replacing tsx, npm, pnpm and nvm with faster equivalents while staying compatible with the existing ecosystem.",
      },
      {
        title: "devl.dev",
        href: "https://www.devl.dev",
        description:
          "Collection of 158 production-ready UI experiments built with React, Tailwind and Base UI, spanning layouts, forms, dashboards, tables and charts, meant to be copied and adapted directly.",
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
        title: "Bytes newsletter",
        href: "https://bytes.dev",
        description:
          "Twice-weekly JavaScript news newsletter from the Syntax.fm crew, summarizing what happened in the JS ecosystem with a conversational, funny tone.",
      },
      {
        title: "ssgoi",
        href: "https://ssgoi.dev",
        description:
          "Page transition library for single-page apps, for animating between routes instead of hard page cuts.",
      },
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
        title: "Gravity UI icons",
        href: "https://github.com/gravity-ui/icons",
        description:
          "Open-source icon set from Yandex's Gravity UI design system, consistent, interface-focused SVG icons free to use in any project.",
      },
      {
        title: "Spacebar Chat",
        href: "https://github.com/spacebarchat",
        description:
          "Open-source, Discord-API-compatible chat client and server, for running your own Discord-like chat platform.",
      },
      {
        title: "OpenTUI",
        href: "https://github.com/anomalyco/opentui",
        description:
          "Framework for building rich terminal UIs, giving terminal apps a component model closer to what web frameworks offer.",
      },
      {
        title: "convert (p2r3)",
        href: "https://github.com/p2r3/convert",
        description:
          "Simple command-line file conversion tool for quickly switching between common file formats.",
      },
      {
        title: "Fallow Tools docs",
        href: "https://docs.fallow.tools",
        description:
          "Documentation site for the Fallow developer tools suite, covering setup, integrations and usage.",
      },
      {
        title: "Arcjet",
        href: "https://arcjet.com",
        description:
          "Security-as-code SDK you drop into your app's own code: rate limiting, bot detection, and a WAF, configured in application logic instead of a separate infrastructure layer.",
      },
      {
        title: "tocn",
        href: "https://tocn.vercel.app",
        description:
          "shadcn, but for terminal-themed components: copy-paste UI pieces styled to look like a terminal window.",
      },
      {
        title: "here.now",
        href: "https://here.now",
        description:
          "Instant hosting for static sites, apps and files, built so an AI agent or a person can publish to a live URL with no account required. Offers temporary anonymous hosting or API-key-based permanent sites with access controls and analytics.",
      },
      {
        title: "Wiretext",
        href: "https://wiretext.app",
        description:
          "Text-based wireframing tool: sketch the simplest possible wireframe using Unicode UI shapes and keyboard shortcuts, then export it as plain text or markdown for sharing.",
      },
      {
        title: "Transfer.zip",
        href: "https://transfer.zip",
        description:
          "Send large files via a link without creating an account, an alternative to WeTransfer for quick one-off transfers.",
      },
      {
        title: "Sho0gle",
        href: "https://sho0gle.dev",
        description:
          "Quick file and text sharing tool for one-off transfers via a link.",
      },
      {
        title: "Best Alternatives",
        href: "https://bestalternatives.dev/en/alternatives",
        description:
          "Directory pairing popular paid SaaS tools with open-source alternatives you can self-host instead.",
      },
      {
        title: "WinWinKit",
        href: "https://winwinkit.com",
        description:
          "Marketing platform for app developers to run affiliate campaigns, referral programs and promo codes, handling tracking, rewards and payouts across iOS, Android and desktop.",
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
        title: "SurveyJS library",
        href: "https://github.com/surveyjs/survey-library",
        description:
          "Open-source JavaScript survey and form builder, for embedding complex, logic-driven forms directly in your own app.",
      },
      {
        title: "Conductor",
        href: "https://www.conductor.build",
        description:
          "Runs multiple parallel coding agents (Claude Code, Codex, Cursor) on your Mac in isolated workspaces, so you can monitor several at once and merge the results together.",
      },
      {
        title: "ties (raffomania)",
        href: "https://github.com/raffomania/ties",
        description:
          "CLI tool for managing symlinked dotfiles, keeping your config files in one repo and symlinked into place across machines.",
      },
      {
        title: "airpipe",
        href: "https://github.com/sanyam-g/airpipe",
        description:
          "Lightweight data pipeline tool for moving and transforming data between sources without a heavyweight ETL platform.",
      },
      {
        title: "html2rss",
        href: "https://github.com/html2rss/html2rss",
        description:
          "Turns any webpage into an RSS feed by scraping its structure, useful for sites that don't publish a feed of their own.",
      },
      {
        title: "getprojekt",
        href: "https://www.getprojekt.com",
        description:
          "Design-engineered project management tool ('Design Engineered' is its own tagline), aimed at freelancers and small teams.",
      },
      {
        title: "docmd",
        href: "https://docmd.io",
        description:
          "Turns a markdown source into a full documentation site, similar in spirit to Docusaurus but lighter weight.",
      },
      {
        title: "ToolmateX",
        href: "https://toolmatex.com",
        description:
          "Collection of free, ad-free browser utilities for developers, designers and data people: code formatting, color conversion, text manipulation and security tools, most working fully offline.",
      },
      {
        title: "EmailMD",
        href: "https://www.emailmd.dev",
        description:
          "Write responsive HTML emails using Markdown syntax instead of hand-coding table-based HTML, with an AI-assisted MCP integration for writing, linting and previewing emails live.",
      },
      {
        title: "PNG to ICO",
        href: "https://png-to-ico.com",
        description:
          "Converts PNG images into ICO favicons directly in the browser.",
      },
      {
        title: "JSON for You",
        href: "https://json4u.com",
        description:
          "JSON formatter, viewer and validator for cleaning up and inspecting JSON payloads.",
      },
      {
        title: "SVG Path Editor",
        href: "https://yqnn.github.io/svg-path-editor",
        description:
          "Visual editor for SVG path data: drag control points and see the `d` attribute update live, instead of hand-editing path commands.",
      },
      {
        title: "nomnoml",
        href: "https://nomnoml.com",
        description:
          "Draws UML diagrams from a simple text syntax, type a description and get a rendered class/sequence diagram.",
      },
      {
        title: "Azimutt",
        href: "https://azimutt.app",
        description:
          "Tool for exploring and documenting large, complex database schemas visually, built for schemas too big to reason about from raw SQL alone.",
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
        title: "Accept Markdown",
        href: "https://acceptmarkdown.com",
        description:
          "Renders a markdown document as a clean, shareable web page without needing a full static site setup.",
      },
      {
        title: "Galaxybrain",
        href: "https://galaxybrain.com",
        description:
          "Local-first information management tool combining document writing with spreadsheet-style calculations, a 'digital brain' for organizing files entirely on your desktop with no account or cloud storage required.",
      },
      {
        title: "GitInspect",
        href: "https://www.gitinspect.com",
        description:
          "Visualizes and inspects Git repository history for understanding how a codebase evolved over time.",
      },
      {
        title: "Plunk",
        href: "https://www.useplunk.com",
        description:
          "Open-source email platform positioned as an alternative to SendGrid, for sending transactional and marketing email from your own infrastructure.",
      },
      {
        title: "opensrc (Vercel Labs)",
        href: "https://github.com/vercel-labs/opensrc",
        description:
          "Vercel Labs experiment for open-source contribution tooling, exploring ways to make it easier to find and ship OSS contributions.",
      },
      {
        title: "Hyperframes",
        href: "https://github.com/heygen-com/hyperframes",
        description:
          "Open-source framework by HeyGen that converts HTML, CSS, media and animation into deterministic MP4 video, built for AI coding agents: write HTML, render video, with skills that automate the video-production workflow.",
      },
      {
        title: "Monosketch",
        href: "https://monosketch.io",
        description:
          "Draw ASCII and box diagrams directly in the browser with a proper drag-and-drop editor instead of hand-typing characters.",
      },
      {
        title: "almostnode",
        href: "https://almostnode.dev",
        description:
          "Runs Node.js, Next.js, Vite and Express entirely in the browser with no backend server, using a virtual filesystem and shimmed Node modules, useful for interactive demos and playgrounds.",
      },
      {
        title: "Blueberry",
        href: "https://www.meetblueberry.com",
        description:
          "AI-native product development platform that unifies a code editor, terminal, browser preview and canvas into one workspace, with Claude wired in to see your code, browser output and running app at once.",
      },
      {
        title: "Ultracite",
        href: "https://www.ultracite.ai",
        description:
          "Zero-config Biome preset for linting and formatting, drop it in and get a sensible, opinionated ruleset without hand-tuning config.",
      },
      {
        title: "Typesense",
        href: "https://typesense.org",
        description:
          "Fast, open-source, typo-tolerant search engine built as a simpler self-hostable alternative to Algolia or Elasticsearch for site and app search.",
      },
      {
        title: "Oneshot.zip",
        href: "https://oneshot.zip",
        description:
          "One-off file sharing tool for sending a file via a single-use link.",
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
        title: "Supabase docs over SSH",
        href: "https://supabase.com/blog/supabase-docs-over-ssh",
        description:
          "Supabase engineering blog post on serving their documentation through an SSH terminal session, a novel way to browse docs without a browser.",
      },
      {
        title: "OpenStatus registry",
        href: "https://www.openstatus.dev/registry",
        description:
          "Open-source registry of self-hosted status page projects, cataloging tools like the ones in this list's self-hosted-software group.",
      },
      {
        title: "LowEndBox",
        href: "https://lowendbox.com",
        description:
          "Long-running blog of deals and reviews for cheap VPS hosting, a go-to for finding low-cost virtual servers.",
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
        title: "gists.sh",
        href: "https://gists.sh",
        description:
          "Cleaner viewer for GitHub Gists: swap 'gist.github.com' for 'gists.sh' in any Gist URL to get a minimal, formatted view with dark mode and display options.",
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
        title: "itty.dev",
        href: "https://itty.dev",
        description:
          "Family of ultra-small web dev libraries (itty-router, itty-fetcher, itty-time) optimized to run in a few hundred bytes each, built for serverless and edge environments where bundle size directly affects cost.",
      },
      {
        title: "JustGage",
        href: "https://toorshia.github.io/justgage",
        description:
          "Lightweight JavaScript library for drawing animated gauge and dial charts with no dependencies beyond Raphael/SVG.",
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
        title: "Sub-Agents Directory",
        href: "https://sub-agents.directory",
        description:
          "Directory of 200+ ready-to-copy Claude Code sub-agent prompts across React, Python, TypeScript and more, plus a collection of MCP servers for Slack, Postgres, Figma and Vercel.",
      },
      {
        title: "Table Format Converter",
        href: "https://www.tableformatconverter.com",
        description:
          "Free tool for converting tabular data between CSV, HTML, JSON, Markdown and more, running fully client-side so data never leaves your browser.",
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
        title: "Label Studio",
        href: "https://labelstud.io",
        description:
          "Open-source data labeling tool for machine learning, supporting text, image, audio and video annotation for building training datasets.",
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
        title: "types.kitlangton.com",
        href: "https://types.kitlangton.com",
        description:
          "Visualizer for TypeScript type structures, for seeing how a complex generic or conditional type actually resolves.",
      },
      {
        title: "Diffs",
        href: "https://diffs.com",
        description:
          "Tool for comparing and sharing text and code diffs via a link.",
      },
      {
        title: "Sparkbites",
        href: "https://sparkbites.dev",
        description:
          "Curated design inspiration directory covering 270+ sites, decoding each one's fonts, colors and tech stack specifically for AI agents to reference, with an MCP server for pulling the data into Claude or Cursor.",
      },
      {
        title: "Autosend",
        href: "https://autosend.com",
        description:
          "Automated email sending platform for scheduling and delivering transactional or campaign email.",
      },
      {
        title: "Cap.js",
        href: "https://capjs.js.org",
        description:
          "Lightweight, privacy-friendly CAPTCHA alternative that avoids the tracking and heavy scripts of reCAPTCHA-style widgets.",
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
      {
        title: "Oklch.fyi",
        href: "https://oklch.fyi",
        description:
          "OKLCH color picker and converter, for working in the perceptually uniform OKLCH color space instead of RGB or HSL.",
      },
      {
        title: "RSSHub docs",
        href: "https://docs.rsshub.app",
        description:
          "Documentation for RSSHub, the open-source project that generates RSS feeds from almost any site, even ones that don't publish one natively.",
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
        title: "Documenso",
        href: "https://documenso.com",
        description:
          "Open-source alternative to DocuSign for collecting legally binding e-signatures on your own infrastructure.",
      },
      {
        title: "Trigger.dev",
        href: "https://trigger.dev",
        description:
          "Open-source background jobs and workflow platform for running long-running or scheduled tasks reliably outside the request/response cycle, with built-in retries and observability.",
      },
      {
        title: "Unosend",
        href: "https://www.unosend.co",
        description:
          "Transactional email sending service for delivering app-generated emails like receipts and password resets.",
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
        title: "Typefully",
        href: "https://typefully.com",
        description:
          "Twitter/X thread writing and scheduling tool with a distraction-free composer built specifically for threads rather than single posts.",
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
        title: "Resume Matcher",
        href: "https://resumematcher.fyi",
        description:
          "Matches your resume against a specific job description using AI, highlighting gaps and keyword mismatches before you apply.",
      },
      {
        title: "Autumn",
        href: "https://useautumn.com",
        description:
          "Open-source billing platform that sits alongside Stripe rather than replacing it, managing subscriptions, usage tracking, credits and feature entitlements through a simple API, aimed at AI startups with usage-based pricing.",
      },
      {
        title: "Liquid Glass (shuding)",
        href: "https://github.com/shuding/liquid-glass",
        description:
          "CSS/JS recreation of Apple's Liquid Glass visual effect by Shu Ding (creator of SWR/Next.js contributor), for bringing the effect to the web.",
      },
      {
        title: "Web Check",
        href: "https://web-check.xyz",
        description:
          "Runs a full OSINT and security check on any website: DNS records, headers, certificates, hosting and more, in one report.",
      },
      {
        title: "Freesound",
        href: "https://freesound.org",
        description:
          "Large, long-running library of Creative Commons-licensed sound effects and field recordings, searchable and free to use with attribution.",
      },
      {
        title: "Online-Convert",
        href: "https://www.online-convert.com",
        description:
          "Free online file format converter supporting a wide range of document, image, audio and video formats.",
      },
      {
        title: "MSW",
        href: "https://mswjs.io",
        description:
          "Mock Service Worker: intercepts real network requests at the browser/Node level for API mocking in tests and dev environments, so components hit realistic mocked responses instead of a mocked fetch function.",
      },
      {
        title: "Media Cheatsheet",
        href: "https://mediacheatsheet.com",
        description:
          "Quick reference for common CSS media query breakpoints, saving a trip to check exact device widths.",
      },
      {
        title: "NativeWind",
        href: "https://www.nativewind.dev",
        description:
          "Brings Tailwind CSS's utility classes to React Native, so styling mobile components uses the same className syntax as a Tailwind web project.",
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
    ],
  },
  {
    title: "Self-hosted software",
    links: [
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
        title: "f1lemock",
        href: "https://f1lemock.com",
        description:
          "Free file and device mockup generator for presenting screenshots and app UI in realistic frames.",
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
    ],
  },
  {
    title: "Animated icon libraries",
    links: [
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
  {
    title: "SwiftUI",
    links: [
      {
        title: "SwiftUI Microinteractions",
        href: "https://github.com/iamvishal16/swiftui-microinteractions",
        description:
          "Claude Code / Cursor / Codex agent skill that generates production-ready SwiftUI micro-interactions from plain-English prompts, encoding spring physics presets, haptic feedback grammar and glass-morphism aesthetics drawn from the author's Animo animation library.",
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
