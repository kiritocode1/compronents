export function getContentArchitecturePageStyles(assetBase: string): string {
  return `
@font-face{font-family:CapGeist;src:url("${assetBase}/geist-sans.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}
@font-face{font-family:CapMono;src:url("${assetBase}/geist-mono.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}

.content-architecture-page{
  --cap-paper:#f1eee7;
  --cap-ink:#232323;
  --cap-line:rgba(255,255,255,.12);
  position:relative;
  isolation:isolate;
  min-height:100svh;
  overflow-x:clip;
  background:var(--cap-ink);
  color:var(--cap-ink);
  font-family:CapGeist,ui-sans-serif,sans-serif;
  font-size:16px;
  line-height:1.16;
  text-rendering:geometricPrecision;
  -webkit-font-smoothing:antialiased;
}
.content-architecture-page *,
.content-architecture-page *::before,
.content-architecture-page *::after{box-sizing:border-box}
.content-architecture-page :where(h1,h2,h3,p,blockquote,pre,ul){margin:0}
.content-architecture-page :where(button,input,textarea){font:inherit}
.content-architecture-page button{color:inherit}
.content-architecture-page a{color:inherit;text-decoration:none}
.content-architecture-page .cap-mono{font-family:CapMono,ui-monospace,monospace}
.content-architecture-page .cap-paper{background:var(--cap-paper);color:var(--cap-ink)}
.content-architecture-page .cap-dark{background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-container{width:min(100% - 32px,1120px);margin-inline:auto}
.content-architecture-page .cap-kicker{
  font:400 13px/1.2 CapMono,monospace;
  letter-spacing:-.025em;
  text-transform:uppercase;
}
.content-architecture-page .cap-button{
  display:inline-flex;
  min-height:48px;
  align-items:center;
  justify-content:center;
  border:0;
  border-radius:8px;
  background:var(--cap-ink);
  color:#fff;
  cursor:pointer;
  font:400 14px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-button span{padding:0 24px}
.content-architecture-page .cap-button span+span{
  border-left:1px solid var(--cap-paper);
}
.content-architecture-page .cap-button-light{background:var(--cap-paper);color:var(--cap-ink)}
.content-architecture-page .cap-button-light span+span{border-left-color:var(--cap-ink)}

.content-architecture-page .cap-header{
  position:fixed;
  top:16px;
  left:50%;
  z-index:50;
  display:flex;
  height:55px;
  transform:translateX(-50%);
  align-items:center;
  gap:2px;
  border:1px solid #0c0c0c;
  border-radius:8px;
  background:#202020;
  padding:6px;
  color:#999;
  box-shadow:0 4px 10px rgba(0,0,0,.28);
  font:400 12px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-brand{
  display:grid;
  width:44px;
  height:41px;
  place-items:center;
  border:0;
  border-radius:4px;
  background:#2b2b2b;
  color:#fff;
  cursor:pointer;
}
.content-architecture-page .cap-brand-mark{
  width:22px;
  height:22px;
  background:repeating-linear-gradient(to bottom,currentColor 0 2px,transparent 2px 5px);
  clip-path:polygon(0 0,100% 0,72% 25%,100% 25%,100% 50%,52% 50%,100% 75%,100% 100%,0 100%);
}
.content-architecture-page .cap-menu-toggle{display:none}
.content-architecture-page .cap-nav{display:flex;align-items:center}
.content-architecture-page .cap-nav button,
.content-architecture-page .cap-nav a{
  display:flex;
  height:41px;
  align-items:center;
  border:0;
  border-radius:4px;
  background:transparent;
  padding:0 15px;
  color:#999;
  cursor:pointer;
  white-space:nowrap;
}
.content-architecture-page .cap-nav button:hover,
.content-architecture-page .cap-nav a:hover,
.content-architecture-page .cap-nav [data-active="true"]{background:#303030;color:#fff}

.content-architecture-page .cap-minimap{
  position:fixed;
  top:16px;
  right:16px;
  z-index:49;
  width:96px;
  height:54px;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.35);
  background:#91918f;
  box-shadow:0 4px 10px rgba(0,0,0,.18);
}
.content-architecture-page .cap-minimap::before{
  content:"";
  position:absolute;
  inset:8px;
  background:repeating-linear-gradient(to bottom,#d2d2ce 0 2px,transparent 2px 5px);
  opacity:.65;
}
.content-architecture-page .cap-minimap-progress{
  position:absolute;
  right:0;
  bottom:0;
  left:0;
  height:3px;
  transform-origin:left;
  background:#e39800;
}

.content-architecture-page .cap-more{
  position:fixed;
  right:16px;
  bottom:16px;
  z-index:48;
  display:grid;
  grid-template-columns:auto 48px;
  grid-template-rows:24px 48px;
  color:var(--cap-ink);
  font:400 12px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-more-label{
  grid-column:1;
  align-self:end;
  background:var(--cap-paper);
  padding:5px 8px;
}
.content-architecture-page .cap-more button{
  grid-column:2;
  grid-row:1/3;
  border:0;
  border-radius:4px;
  background:var(--cap-paper);
  cursor:pointer;
  font:400 18px/1 CapMono,monospace;
}

.content-architecture-page .cap-hero{
  display:grid;
  min-height:100svh;
  grid-template-columns:1fr 1fr;
  background:var(--cap-paper);
}
.content-architecture-page .cap-hero-copy{
  position:relative;
  z-index:2;
  display:flex;
  min-width:0;
  flex-direction:column;
  justify-content:center;
  padding:80px;
}
.content-architecture-page .cap-hero h1{
  max-width:550px;
  margin-top:24px;
  font-size:clamp(40px,4.1vw,72px);
  font-weight:500;
  letter-spacing:-.045em;
  line-height:.98;
}
.content-architecture-page .cap-hero-deck{
  max-width:470px;
  margin-top:28px;
  color:#64615e;
  font-size:18px;
  line-height:1.25;
}
.content-architecture-page .cap-audience{margin-top:18px;color:#666;font:400 13px/1.3 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-hero-cta{margin-top:34px;align-self:flex-start}
.content-architecture-page .cap-specs{
  position:absolute;
  right:80px;
  bottom:46px;
  left:80px;
  display:grid;
  grid-template-columns:repeat(3,1fr);
  gap:24px;
  font:400 12px/1.7 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-hero-art{
  position:relative;
  min-width:0;
  overflow:hidden;
  background:var(--cap-ink);
}
.content-architecture-page .cap-spiral{
  position:absolute;
  top:50%;
  left:50%;
  width:max(105%,740px);
  aspect-ratio:1;
  transform:translate(-50%,-50%);
  color:#f5f5f2;
}
.content-architecture-page .cap-spiral svg{width:100%;height:100%;overflow:visible}
.content-architecture-page .cap-spiral text{
  fill:currentColor;
  font:600 10px CapMono,monospace;
  letter-spacing:.11em;
}
.content-architecture-page .cap-spiral path{fill:none;stroke:rgba(255,255,255,.14);stroke-dasharray:1 8}
.content-architecture-page .cap-spiral g{transform-origin:50% 50%;animation:cap-spin 80s linear infinite}
.content-architecture-page .cap-spiral g:nth-child(even){animation-direction:reverse;animation-duration:110s}
@keyframes cap-spin{to{transform:rotate(360deg)}}

.content-architecture-page .cap-problems{padding:160px 0}
.content-architecture-page .cap-problem-layout{display:grid;grid-template-columns:1fr 1fr;gap:96px}
.content-architecture-page .cap-problem-table{margin-top:34px;border-top:1px solid rgba(35,35,35,.35)}
.content-architecture-page .cap-problem-row{
  display:grid;
  grid-template-columns:40px 1fr auto;
  gap:12px;
  border-bottom:1px solid rgba(35,35,35,.22);
  padding:9px 0;
  font:400 11px/1.3 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-problem-row span:first-child{color:#8f8b84}
.content-architecture-page .cap-problem-total{display:flex;justify-content:space-between;padding-top:16px;font:500 12px/1.2 CapMono,monospace}
.content-architecture-page .cap-problem-copy{align-self:end}
.content-architecture-page .cap-problem-copy h2{
  max-width:500px;
  font-size:clamp(40px,4.7vw,72px);
  font-weight:500;
  letter-spacing:-.05em;
  line-height:.98;
}
.content-architecture-page .cap-problem-copy p{max-width:530px;margin-top:28px;color:#666;font-size:17px;line-height:1.32}

.content-architecture-page .cap-noise{position:absolute;inset:0;z-index:-1;overflow:hidden;background:var(--cap-ink)}
.content-architecture-page .cap-noise pre{
  position:absolute;
  inset:-20px;
  overflow:hidden;
  color:#fff;
  font:500 8px/1 CapMono,monospace;
  opacity:.11;
  white-space:pre-wrap;
  word-break:break-all;
}
.content-architecture-page .cap-features{position:relative;isolation:isolate;padding:160px 0}
.content-architecture-page .cap-features-intro{display:grid;grid-template-columns:1fr 1fr;gap:96px;margin-bottom:180px}
.content-architecture-page .cap-features-intro h2{
  max-width:570px;
  font-size:clamp(48px,6.3vw,96px);
  font-weight:500;
  letter-spacing:-.055em;
  line-height:.94;
}
.content-architecture-page .cap-features-intro p{max-width:480px;align-self:end;color:#bbb;font-size:17px;line-height:1.3}
.content-architecture-page .cap-feature-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:1px;border:1px solid var(--cap-line);background:var(--cap-line)}
.content-architecture-page .cap-feature{
  min-height:420px;
  background:rgba(35,35,35,.84);
  padding:36px 30px;
  transition:background .25s ease;
}
.content-architecture-page .cap-feature:hover{background:#282828}
.content-architecture-page .cap-feature h3{font:500 12px/1.3 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-feature p{margin-top:88px;color:#c7c7c7;font-size:15px;line-height:1.35}

.content-architecture-page .cap-repo{height:100svh;padding:80px;background:var(--cap-paper)}
.content-architecture-page .cap-repo-shell{display:flex;height:100%;min-height:0;flex-direction:column}
.content-architecture-page .cap-repo-kicker{margin-bottom:18px}
.content-architecture-page .cap-ide{
  display:flex;
  min-height:0;
  flex:1;
  flex-direction:column;
  overflow:hidden;
  border:1px solid #090909;
  border-radius:6px;
  background:#181818;
  color:#ddd;
  box-shadow:0 5px 16px rgba(0,0,0,.25);
}
.content-architecture-page .cap-ide-bar{
  display:flex;
  height:34px;
  flex:none;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid var(--cap-line);
  color:#777;
  font:400 10px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-ide-main{display:grid;min-height:0;flex:1;grid-template-columns:240px 1fr}
.content-architecture-page .cap-files{min-height:0;overflow:auto;border-right:1px solid var(--cap-line);padding:10px 0}
.content-architecture-page .cap-files button{
  display:block;
  width:100%;
  border:0;
  background:transparent;
  padding:4px 16px;
  color:#999;
  cursor:pointer;
  text-align:left;
  font:400 10px/1.4 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-files button:hover,
.content-architecture-page .cap-files button[data-active="true"]{background:#2a2a2a;color:#fff}
.content-architecture-page .cap-editor{display:grid;min-width:0;min-height:0;grid-template-rows:1fr 200px}
.content-architecture-page .cap-editor textarea{
  min-width:0;
  min-height:0;
  resize:none;
  border:0;
  outline:0;
  background:#191919;
  padding:14px;
  color:#bcbcbc;
  font:400 11px/1.42 CapMono,monospace;
  white-space:pre;
}
.content-architecture-page .cap-terminal{display:flex;min-height:0;flex-direction:column;border-top:1px solid var(--cap-line)}
.content-architecture-page .cap-terminal-title{padding:7px 16px;border-bottom:1px solid var(--cap-line);color:#6f6f6f;font:400 10px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-terminal-output{min-height:0;flex:1;overflow:auto;padding:10px 16px;color:#898989;font:400 10px/1.45 CapMono,monospace;white-space:pre-wrap}
.content-architecture-page .cap-terminal-line{display:flex;align-items:center;padding:0 16px 10px;color:#aaa;font:400 10px/1 CapMono,monospace}
.content-architecture-page .cap-terminal-line input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#eee}

.content-architecture-page .cap-showcase{padding:160px 80px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-showcase-head{display:grid;grid-template-columns:1fr 1fr;gap:80px;margin-bottom:110px}
.content-architecture-page .cap-showcase h2{font-size:clamp(44px,4.8vw,76px);font-weight:500;letter-spacing:-.05em;line-height:.96}
.content-architecture-page .cap-showcase-head p{max-width:510px;align-self:end;color:#aaa;font-size:16px;line-height:1.3}
.content-architecture-page .cap-project-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:80px 24px}
.content-architecture-page .cap-project{display:block;min-width:0}
.content-architecture-page .cap-ascii{
  position:relative;
  aspect-ratio:16/9;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.12);
  background:#191919;
}
.content-architecture-page .cap-ascii img{position:absolute;width:1px;height:1px;opacity:0;pointer-events:none}
.content-architecture-page .cap-ascii pre{
  position:absolute;
  inset:0;
  display:flex;
  align-items:center;
  justify-content:center;
  overflow:hidden;
  color:#d9d9d3;
  font:500 7px/.82 CapMono,monospace;
  letter-spacing:.02em;
  white-space:pre;
  transform:scale(1.02);
}
.content-architecture-page .cap-project h3{margin-top:12px;font:400 12px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-project:hover .cap-ascii{border-color:#aaa}

.content-architecture-page .cap-testimonials{padding:72px 0 160px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-testimonial-frame{
  position:relative;
  min-height:600px;
  border:1px solid rgba(255,255,255,.14);
  padding:72px 54px 40px;
}
.content-architecture-page .cap-testimonial-frame blockquote{max-width:900px;font-size:clamp(36px,4.8vw,74px);font-weight:400;letter-spacing:-.055em;line-height:1.02}
.content-architecture-page .cap-testimonial-meta{position:absolute;right:54px;bottom:40px;left:54px;display:flex;align-items:end;justify-content:space-between}
.content-architecture-page .cap-person{display:flex;align-items:center;gap:14px;font:400 11px/1.35 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-person img{width:48px;height:48px;border-radius:50%;object-fit:cover;filter:grayscale(1)}
.content-architecture-page .cap-slider-controls{display:flex;align-items:center;gap:8px}
.content-architecture-page .cap-slider-controls button{width:44px;height:38px;border:1px solid rgba(255,255,255,.2);background:transparent;color:#fff;cursor:pointer}
.content-architecture-page .cap-slider-count{margin:0 16px;font:400 12px/1 CapMono,monospace}

.content-architecture-page .cap-pricing{padding:160px 0}
.content-architecture-page .cap-pricing-grid{display:grid;grid-template-columns:1fr 1fr;gap:90px}
.content-architecture-page .cap-pricing h2{font-size:clamp(48px,6.2vw,96px);font-weight:500;letter-spacing:-.055em;line-height:.92}
.content-architecture-page .cap-price-card{overflow:hidden;border-radius:7px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-price{padding:22px 28px;border-bottom:2px solid var(--cap-paper);font-size:32px}
.content-architecture-page .cap-inclusions{padding:22px 28px 32px}
.content-architecture-page .cap-inclusion{display:grid;grid-template-columns:34px 1fr;gap:8px;padding:5px 0;font:400 11px/1.25 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-inclusion span:first-child{color:#666}
.content-architecture-page .cap-price-actions{padding:18px 28px 28px}

.content-architecture-page .cap-faq{padding:160px 80px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-faq-grid{display:grid;grid-template-columns:280px 1fr;gap:80px}
.content-architecture-page .cap-faq h2{font-size:44px;font-weight:500;letter-spacing:-.04em}
.content-architecture-page .cap-faq-cta{margin-top:340px}
.content-architecture-page .cap-faq-item{border-top:1px solid rgba(255,255,255,.14)}
.content-architecture-page .cap-faq-item:last-child{border-bottom:1px solid rgba(255,255,255,.14)}
.content-architecture-page .cap-faq-item button{
  display:grid;
  width:100%;
  grid-template-columns:1fr 28px;
  gap:18px;
  border:0;
  background:transparent;
  padding:17px 0;
  color:#fff;
  cursor:pointer;
  text-align:left;
  font:400 11px/1.35 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-faq-plus{display:grid;width:18px;height:18px;place-items:center;background:#303030}
.content-architecture-page .cap-faq-answer{overflow:hidden}
.content-architecture-page .cap-faq-answer p{max-width:800px;padding:0 46px 24px 0;color:#a9a9a9;font-size:15px;line-height:1.38;white-space:pre-line}

.content-architecture-page .cap-ascii-banner{padding:80px;background:var(--cap-paper)}
.content-architecture-page .cap-ascii-banner pre{
  overflow:hidden;
  border:1px solid var(--cap-ink);
  border-radius:5px;
  background:#202020;
  padding:24px;
  color:#fff;
  font:500 10px/1 CapMono,monospace;
  white-space:pre;
}
.content-architecture-page .cap-footer{position:relative;isolation:isolate;padding:90px 80px 60px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-footer-grid{display:grid;grid-template-columns:1fr auto;gap:60px;align-items:start}
.content-architecture-page .cap-newsletter{display:flex;max-width:500px;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:4px}
.content-architecture-page .cap-newsletter input{min-width:0;flex:1;border:0;outline:0;background:transparent;padding:0 12px;color:#fff;font:400 11px/1 CapMono,monospace}
.content-architecture-page .cap-newsletter button{border:0;border-radius:4px;background:var(--cap-paper);padding:12px 18px;color:var(--cap-ink);cursor:pointer;font:400 10px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-footer-links{display:grid;gap:7px;text-align:right;font:400 11px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-footer-bottom{display:flex;justify-content:space-between;margin-top:100px;color:#aaa;font:400 10px/1.4 CapMono,monospace;text-transform:uppercase}

.content-architecture-page .cap-drawer-backdrop{position:fixed;inset:0;z-index:60;background:rgba(0,0,0,.45)}
.content-architecture-page .cap-drawer{
  position:fixed;
  right:16px;
  bottom:16px;
  z-index:61;
  width:min(440px,calc(100vw - 32px));
  border:1px solid #050505;
  border-radius:8px;
  background:var(--cap-paper);
  padding:24px;
  box-shadow:0 18px 60px rgba(0,0,0,.4);
}
.content-architecture-page .cap-drawer-head{display:flex;justify-content:space-between;align-items:center}
.content-architecture-page .cap-drawer-head button{border:0;background:transparent;cursor:pointer;font:400 18px/1 CapMono,monospace}
.content-architecture-page .cap-drawer h2{font-size:32px;font-weight:500;letter-spacing:-.04em}
.content-architecture-page .cap-drawer p{margin-top:18px;color:#666;font-size:15px;line-height:1.35}
.content-architecture-page .cap-drawer a{display:inline-flex;margin-top:24px;border-bottom:1px solid;font:400 12px/1.4 CapMono,monospace;text-transform:uppercase}

@media (max-width:900px){
  .content-architecture-page .cap-container{width:min(100% - 32px,680px)}
  .content-architecture-page .cap-header{top:8px;left:8px;width:173px;height:auto;transform:none;display:block}
  .content-architecture-page .cap-header-top{display:flex;height:32px;align-items:center}
  .content-architecture-page .cap-brand{width:38px;height:32px;background:transparent}
  .content-architecture-page .cap-brand-mark{width:20px;height:20px}
  .content-architecture-page .cap-menu-toggle{display:flex;min-width:0;flex:1;align-items:center;justify-content:space-between;border:0;background:transparent;color:#ddd;cursor:pointer}
  .content-architecture-page .cap-menu-toggle span:last-child{display:grid;width:26px;height:26px;place-items:center;border-radius:2px;background:#616161}
  .content-architecture-page .cap-nav{display:none;padding-top:7px}
  .content-architecture-page .cap-nav[data-open="true"]{display:block}
  .content-architecture-page .cap-nav button,
  .content-architecture-page .cap-nav a{width:100%;height:27px;padding:0 3px;text-align:left}
  .content-architecture-page .cap-minimap{top:8px;right:8px;width:78px;height:44px}
  .content-architecture-page .cap-more{right:8px;bottom:8px}
  .content-architecture-page .cap-hero{grid-template-columns:1fr;grid-template-rows:auto 80svh}
  .content-architecture-page .cap-hero-copy{min-height:68svh;justify-content:end;padding:150px 16px 48px}
  .content-architecture-page .cap-hero h1{margin-top:24px;font-size:40px;line-height:1}
  .content-architecture-page .cap-hero-deck{margin-top:30px;font-size:14px;line-height:1.25}
  .content-architecture-page .cap-audience{font-size:11px}
  .content-architecture-page .cap-hero-cta{margin-top:32px}
  .content-architecture-page .cap-specs{display:none}
  .content-architecture-page .cap-spiral{top:46%;width:155vw;min-width:620px}
  .content-architecture-page .cap-problems{padding:72px 0}
  .content-architecture-page .cap-problem-layout{grid-template-columns:1fr;gap:72px}
  .content-architecture-page .cap-problem-copy h2{font-size:42px}
  .content-architecture-page .cap-problem-copy p{font-size:15px}
  .content-architecture-page .cap-features{padding:72px 0}
  .content-architecture-page .cap-features-intro{grid-template-columns:1fr;gap:48px;margin-bottom:72px}
  .content-architecture-page .cap-features-intro h2{font-size:48px}
  .content-architecture-page .cap-feature-grid{grid-template-columns:1fr}
  .content-architecture-page .cap-feature{min-height:310px}
  .content-architecture-page .cap-feature p{margin-top:58px}
  .content-architecture-page .cap-repo{height:100svh;padding:72px 16px}
  .content-architecture-page .cap-ide-main{grid-template-columns:96px 1fr}
  .content-architecture-page .cap-files button{padding-inline:8px;font-size:8px;overflow:hidden;text-overflow:ellipsis}
  .content-architecture-page .cap-editor{grid-template-rows:1fr 180px}
  .content-architecture-page .cap-editor textarea{font-size:9px}
  .content-architecture-page .cap-showcase{padding:72px 16px}
  .content-architecture-page .cap-showcase-head{grid-template-columns:1fr;gap:28px;margin-bottom:72px}
  .content-architecture-page .cap-showcase h2{font-size:44px}
  .content-architecture-page .cap-project-grid{grid-template-columns:1fr;gap:44px}
  .content-architecture-page .cap-ascii pre{font-size:5px}
  .content-architecture-page .cap-testimonials{padding:72px 16px}
  .content-architecture-page .cap-testimonial-frame{min-height:548px;padding:36px 24px 30px}
  .content-architecture-page .cap-testimonial-frame blockquote{font-size:36px}
  .content-architecture-page .cap-testimonial-meta{right:24px;bottom:30px;left:24px;align-items:start;flex-direction:column;gap:28px}
  .content-architecture-page .cap-pricing{padding:72px 0}
  .content-architecture-page .cap-pricing-grid{grid-template-columns:1fr;gap:48px}
  .content-architecture-page .cap-pricing h2{font-size:48px}
  .content-architecture-page .cap-faq{padding:72px 16px}
  .content-architecture-page .cap-faq-grid{grid-template-columns:1fr;gap:48px}
  .content-architecture-page .cap-faq-cta{margin-top:32px}
  .content-architecture-page .cap-ascii-banner{padding:72px 16px}
  .content-architecture-page .cap-ascii-banner pre{font-size:5px}
  .content-architecture-page .cap-footer{padding:72px 16px 44px}
  .content-architecture-page .cap-footer-grid{grid-template-columns:1fr;gap:56px}
  .content-architecture-page .cap-footer-links{text-align:left}
  .content-architecture-page .cap-footer-bottom{margin-top:72px;align-items:flex-start;flex-direction:column;gap:10px}
}

@media (prefers-reduced-motion:reduce){
  .content-architecture-page .cap-spiral g{animation:none}
  .content-architecture-page *{scroll-behavior:auto!important}
}
`;
}
