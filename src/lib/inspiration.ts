export interface InspirationLink {
  title: string;
  href: string;
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
        title: "Digital Design and Computer Architecture (Spring 2026 livestream)",
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
      lines.push(`- [${link.title}](${link.href})`);
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
