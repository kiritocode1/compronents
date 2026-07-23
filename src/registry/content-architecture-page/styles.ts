export function getContentArchitecturePageStyles(assetBase: string): string {
  return `
@font-face{font-family:CapGeist;src:url("${assetBase}/geist-sans.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}
@font-face{font-family:CapMono;src:url("${assetBase}/geist-mono.woff2") format("woff2");font-style:normal;font-weight:100 900;font-display:swap}

.content-architecture-page{
  --cap-paper:#f1eee7;
  --cap-ink:#232323;
  --cap-line:rgba(255,255,255,.12);
  --cap-accent:#ff9100;
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
.content-architecture-page .cap-sr-only{
  position:absolute;
  width:1px;
  height:1px;
  overflow:hidden;
  clip:rect(0,0,0,0);
  white-space:nowrap;
}
.content-architecture-page :where(button,input,textarea){font:inherit}
.content-architecture-page button{color:inherit}
.content-architecture-page a{color:inherit;text-decoration:none}
.content-architecture-page>section{position:relative;z-index:1}
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
  gap:4px;
  align-items:center;
  justify-content:center;
  border:0;
  border-radius:8px;
  background:transparent;
  color:#fff;
  cursor:pointer;
  font:400 14px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-button span{
  display:grid;
  height:48px;
  place-items:center;
  border-radius:8px;
  background:var(--cap-ink);
  padding:0 24px;
}
.content-architecture-page .cap-button-light{color:var(--cap-ink)}
.content-architecture-page .cap-button-light span{background:var(--cap-paper)}

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
  aspect-ratio:16/9;
  width:96px;
  height:54px;
  opacity:0;
  transition:opacity .4s cubic-bezier(.23,1,.32,1) .4s;
}
.content-architecture-page .cap-minimap-frame{
  pointer-events:none;
  position:relative;
  width:100%;
  height:100%;
  overflow:hidden;
  border-radius:3px;
  background:rgba(0,0,0,.5);
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.15);
  backdrop-filter:blur(4px);
}
.content-architecture-page .cap-minimap-base,
.content-architecture-page .cap-minimap-scan,
.content-architecture-page .cap-minimap-scan-mask,
.content-architecture-page .cap-minimap-scan-counter{
  position:absolute;
  inset:0;
  overflow:hidden;
}
.content-architecture-page .cap-minimap-world{position:absolute;top:0;left:0;will-change:transform}
.content-architecture-page .cap-minimap-world canvas{display:block}
.content-architecture-page .cap-minimap-scan{
  animation:minimapScan 5s ease-in-out infinite;
}
.content-architecture-page .cap-minimap[data-studio-armed="true"] .cap-minimap-scan{display:none}
.content-architecture-page .cap-minimap-scan-mask{
  mask-image:linear-gradient(to top,#000,transparent 60%);
}
.content-architecture-page .cap-minimap-scan-counter{animation:minimapScanCounter 5s ease-in-out infinite}
.content-architecture-page .cap-minimap-scan-glow{
  position:absolute;
  bottom:0;
  left:0;
  right:0;
  height:50%;
  background:linear-gradient(to bottom,transparent,rgba(255,145,0,.2));
}
.content-architecture-page .cap-minimap-scan-line{
  position:absolute;
  right:0;
  bottom:0;
  left:0;
  height:1px;
  background:var(--cap-accent);
}
.content-architecture-page .cap-minimap-scan-dot{
  position:absolute;
  bottom:-2px;
  width:4px;
  height:4px;
  border-radius:50%;
  background:var(--cap-accent);
}
.content-architecture-page .cap-minimap-scan-dot-left{left:-2px}
.content-architecture-page .cap-minimap-scan-dot-right{right:-2px}
.content-architecture-page .cap-minimap>button{
  position:absolute;
  inset:0;
  border:0;
  border-radius:3px;
  background:transparent;
  cursor:pointer;
  transition:box-shadow .15s;
}
.content-architecture-page .cap-minimap>button:hover,
.content-architecture-page .cap-minimap>button:focus-visible{
  outline:0;
  box-shadow:inset 0 0 0 2px var(--cap-accent);
}
.content-architecture-page .cap-minimap-inspect{
  pointer-events:none;
  position:absolute;
  top:100%;
  right:0;
  display:none;
  margin-top:4px;
  border-radius:2px;
  background:#000;
  padding:6px 6px;
  color:rgba(255,255,255,.7);
  font:400 10px/1 CapMono,monospace;
  letter-spacing:.025em;
  text-transform:uppercase;
  white-space:nowrap;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.15);
}
.content-architecture-page .cap-minimap:hover .cap-minimap-inspect{display:block}
.content-architecture-page .cap-studio-field-overlay{
  pointer-events:none;
  position:fixed;
  inset:0;
  z-index:52;
}
.content-architecture-page .cap-studio-field-outline{
  pointer-events:auto;
  position:absolute;
  border:0;
  border-radius:1px;
  background:rgba(255,145,0,.05);
  cursor:pointer;
  box-shadow:inset 0 0 0 1px rgba(255,145,0,.35);
  transition:background .15s,box-shadow .15s;
}
.content-architecture-page .cap-studio-field-outline:hover,
.content-architecture-page .cap-studio-field-outline:focus-visible,
.content-architecture-page .cap-studio-field-outline[data-selected="true"]{
  outline:0;
  background:rgba(255,145,0,.15);
  box-shadow:inset 0 0 0 2px var(--cap-accent);
}
.content-architecture-page .cap-studio-field-outline>span{
  position:absolute;
  bottom:100%;
  left:0;
  display:none;
  margin-bottom:1px;
  border-radius:1px;
  background:var(--cap-accent);
  padding:2px 6px;
  color:#000;
  font:400 10px/1 CapMono,monospace;
  text-transform:uppercase;
  white-space:nowrap;
}
.content-architecture-page .cap-studio-field-outline:hover>span,
.content-architecture-page .cap-studio-field-outline:focus-visible>span,
.content-architecture-page .cap-studio-field-outline[data-selected="true"]>span{display:inline-flex}
.content-architecture-page .cap-studio-panel{
  pointer-events:auto;
  position:absolute;
  top:86px;
  right:16px;
  width:400px;
  overflow:hidden;
  border:8px solid transparent;
  border-radius:8px;
  background:
    linear-gradient(#000,#000) padding-box,
    repeating-conic-gradient(rgba(255,255,255,.22) 0 25%,transparent 0 50%) border-box 0/4px 4px;
  color:#fff;
  font:400 12px/1.25 CapMono,monospace;
  box-shadow:0 16px 50px rgba(0,0,0,.35),inset 0 0 0 1px rgba(255,255,255,.1);
  animation:cap-studio-panel-in .4s cubic-bezier(.23,1,.32,1);
}
.content-architecture-page .cap-studio-panel-bar{
  display:flex;
  height:34px;
  align-items:center;
  gap:8px;
  border-bottom:1px solid rgba(255,255,255,.1);
  padding:0 8px 0 12px;
  color:rgba(255,255,255,.4);
  letter-spacing:.025em;
  text-transform:uppercase;
}
.content-architecture-page .cap-studio-panel-bar>i{
  width:6px;
  height:6px;
  border-radius:50%;
  background:var(--cap-accent);
  animation:cap-studio-pulse 1.8s ease-out infinite;
}
.content-architecture-page .cap-studio-panel-bar>button{
  margin-left:auto;
  border:0;
  border-radius:2px;
  background:transparent;
  padding:2px 6px;
  color:rgba(255,255,255,.5);
  cursor:pointer;
  text-transform:uppercase;
}
.content-architecture-page .cap-studio-panel-bar>button:hover{background:rgba(255,255,255,.1);color:#fff}
.content-architecture-page .cap-studio-panel-head{
  display:flex;
  flex-direction:column;
  gap:4px;
  border-bottom:1px solid rgba(255,255,255,.1);
  padding:12px 16px;
}
.content-architecture-page .cap-studio-panel-head small{color:rgba(255,255,255,.35);font-size:10px;text-transform:uppercase}
.content-architecture-page .cap-studio-panel-head strong{margin-top:4px;color:rgba(255,255,255,.9);font-weight:400;text-transform:uppercase}
.content-architecture-page .cap-studio-panel-head p{color:rgba(255,255,255,.5);font-size:10px;line-height:1.35}
.content-architecture-page .cap-studio-panel-tabs{display:flex;gap:6px;margin-top:8px}
.content-architecture-page .cap-studio-panel-tabs button{
  border:0;
  border-radius:2px;
  background:transparent;
  padding:2px 6px;
  color:rgba(255,255,255,.4);
  cursor:pointer;
  font-size:10px;
  text-transform:uppercase;
}
.content-architecture-page .cap-studio-panel-tabs button[data-active="true"]{background:rgba(255,255,255,.1);color:rgba(255,255,255,.9)}
.content-architecture-page .cap-studio-panel-body{max-height:58vh;overflow:auto;padding:16px}
.content-architecture-page .cap-studio-panel-body p{color:rgba(255,255,255,.4);font-size:10px}
.content-architecture-page .cap-studio-panel-body label{display:flex;flex-direction:column;gap:8px;color:rgba(255,255,255,.5);text-transform:uppercase}
.content-architecture-page .cap-studio-panel-body textarea{
  min-height:120px;
  resize:vertical;
  border:1px solid rgba(255,255,255,.1);
  border-radius:4px;
  outline:0;
  background:rgba(255,255,255,.05);
  padding:10px;
  color:#fff;
  font:400 12px/1.4 CapMono,monospace;
  text-transform:none;
}
.content-architecture-page .cap-studio-panel-body textarea:focus{border-color:var(--cap-accent)}
@keyframes cap-studio-panel-in{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}
@keyframes cap-studio-pulse{75%,100%{opacity:0;transform:scale(2.6)}}

@keyframes minimapScan{
  0%{opacity:1;transform:translateY(-101%)}
  30%{opacity:1;transform:translateY(0)}
  38%,100%{opacity:0;transform:translateY(0)}
}
@keyframes minimapScanCounter{
  0%{transform:translateY(101%)}
  30%,100%{transform:translateY(0)}
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
  position:relative;
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
  font-size:clamp(40px,3.1vw,60px);
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
  inset:0;
  cursor:pointer;
  touch-action:none;
  color:#f5f5f2;
  user-select:none;
}
.content-architecture-page .cap-spiral canvas{position:absolute;inset:0;display:block;width:100%;height:100%}
.content-architecture-page .cap-spiral span{
  position:absolute;
  top:0;
  left:0;
  z-index:2;
  pointer-events:none;
  opacity:0;
  background:#fff;
  padding:2px;
  color:#000;
  font:400 10px/1 CapMono,monospace;
  text-transform:uppercase;
  transition:opacity .15s ease;
}
.content-architecture-page .cap-spiral span[data-visible="true"]{opacity:1}
.content-architecture-page .cap-scroll-cue{
  position:absolute;
  bottom:40px;
  left:calc(50% + 8px);
  z-index:3;
  display:flex;
  width:22px;
  height:68px;
  align-items:center;
  justify-content:center;
  border:1px solid rgba(255,255,255,.2);
  border-radius:4px;
  background:#080808;
  cursor:pointer;
  transform:translateX(-50%);
}
.content-architecture-page .cap-scroll-cue span{
  width:6px;
  height:48px;
  background:repeating-linear-gradient(to bottom,rgba(255,255,255,.16) 0 1px,transparent 1px 8px);
}

.content-architecture-page .cap-problems{padding:160px 0}
.content-architecture-page .cap-problem-layout{display:grid;width:100%;max-width:none;grid-template-columns:524px 632px;gap:124px}
.content-architecture-page .cap-problem-window{
  width:424px;
  height:317px;
  margin-left:100px;
  border:1px dashed rgba(35,35,35,.45);
  border-radius:8px;
  padding:8px;
  background:
    repeating-conic-gradient(rgba(255,255,255,.2) 0 25%,transparent 0 50%) 0/4px 4px,
    #232323;
  box-shadow:0 8px 20px rgba(0,0,0,.15);
}
.content-architecture-page .cap-problem-window-shell{
  height:100%;
  overflow:hidden;
  border:1px solid rgba(255,255,255,.1);
  border-radius:4px;
  background:var(--cap-ink);
  color:#fff;
}
.content-architecture-page .cap-problem-window-title{
  display:flex;
  height:26px;
  align-items:center;
  border-bottom:1px solid rgba(255,255,255,.1);
  padding:0 16px;
  color:rgba(255,255,255,.4);
  font:400 11px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-problem-window-body{padding:16px;overflow:hidden}
.content-architecture-page .cap-problem-terminal-row{
  display:flex;
  min-width:378px;
  min-height:19px;
  align-items:baseline;
  justify-content:space-between;
  gap:16px;
  font:400 11px/1.45 CapMono,monospace;
  white-space:pre;
}
.content-architecture-page .cap-problem-terminal-copy{display:flex;gap:24px}
.content-architecture-page .cap-problem-terminal-copy>span:first-child{color:#666}
.content-architecture-page .cap-problem-terminal-copy i{
  display:inline-block;
  width:6px;
  height:1em;
  margin-left:1px;
  background:currentColor;
  vertical-align:-.15em;
  animation:cap-cursor .8s steps(1) infinite;
}
.content-architecture-page .cap-problem-terminal-total{margin-top:19px}
@keyframes cap-cursor{50%{opacity:0}}
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
.content-architecture-page .cap-problem-copy{width:552px;align-self:start}
.content-architecture-page .cap-problem-copy h2{
  max-width:552px;
  font-size:44px;
  font-weight:500;
  letter-spacing:-.04em;
  line-height:1.1;
}
.content-architecture-page .cap-problem-copy p{max-width:552px;margin-top:18px;color:#666;font-size:16px;line-height:1.32}
.content-architecture-page .cap-problem-copy h2+p{margin-top:32px}

.content-architecture-page .cap-glyph-field{
  position:relative;
  width:100%;
  height:100%;
  overflow:hidden;
  background:var(--cap-ink);
}
.content-architecture-page .cap-glyph-field[data-interactive="true"]{cursor:pointer}
.content-architecture-page .cap-glyph-cursor{
  pointer-events:none;
  position:absolute;
  z-index:2;
  top:0;
  left:0;
  opacity:0;
  border-radius:1px;
  background:#f1eee7;
  padding:2px 3px;
  color:#232323;
  font:400 10px/1 CapMono,monospace;
  text-transform:uppercase;
  transition:opacity .1s;
  will-change:transform;
}
.content-architecture-page .cap-glyph-cursor[data-visible="true"]{opacity:1}
.content-architecture-page .cap-features{position:relative;isolation:isolate;padding:160px 80px}
.content-architecture-page .cap-features-field{position:absolute;inset:0;z-index:0}
.content-architecture-page .cap-features-field>.cap-glyph-field{position:sticky;top:0;height:100svh}
.content-architecture-page .cap-features>.cap-container{position:relative;z-index:1;width:457px;margin:0}
.content-architecture-page .cap-features-intro{display:flex;flex-direction:column;gap:32px;margin-bottom:80px}
.content-architecture-page .cap-features-intro h2{
  max-width:457px;
  font-size:44px;
  font-weight:500;
  letter-spacing:-.04em;
  line-height:1.1;
}
.content-architecture-page .cap-features-intro p{max-width:457px;color:#ddd;font-size:16px;line-height:1.32}
.content-architecture-page .cap-feature-grid{display:flex;width:457px;flex-direction:column;gap:64px}
.content-architecture-page .cap-feature{
  width:50%;
  min-height:0;
  background:transparent;
  padding:0;
}
.content-architecture-page .cap-feature:nth-child(3n+2){margin-left:20%}
.content-architecture-page .cap-feature:nth-child(3n){margin-left:40%}
.content-architecture-page .cap-feature h3{font:500 16px/1.25 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-feature p{margin-top:12px;color:#ddd;font-size:16px;line-height:1.25}

.content-architecture-page .cap-repo{height:100svh;padding:80px;background:var(--cap-paper)}
.content-architecture-page .cap-repo-shell{display:flex;height:100%;min-height:0;flex-direction:column}
.content-architecture-page .cap-ide{
  display:flex;
  min-height:0;
  flex:1;
  flex-direction:column;
  overflow:hidden;
  border:1px dashed rgba(35,35,35,.5);
  border-radius:8px;
  background:
    repeating-conic-gradient(rgba(255,255,255,.2) 0 25%,transparent 0 50%) 0/4px 4px,
    #232323;
  padding:8px;
  color:#ddd;
  box-shadow:0 5px 16px rgba(0,0,0,.25);
}
.content-architecture-page .cap-ide-bar{
  position:relative;
  display:flex;
  height:34px;
  flex:none;
  align-items:center;
  justify-content:center;
  border-bottom:1px solid var(--cap-line);
  border-radius:4px 4px 0 0;
  background:#222;
  color:#777;
  font:400 13px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-ide-tools{position:absolute;right:12px;font-size:10px}
.content-architecture-page .cap-ide-main{display:grid;min-height:0;flex:1;grid-template-columns:241px 1fr;background:#1d1d1d}
.content-architecture-page .cap-files{min-height:0;overflow:hidden;border-right:1px solid var(--cap-line);padding:10px 0}
.content-architecture-page .cap-files button{
  display:block;
  width:100%;
  border:0;
  background:transparent;
  padding:3px 16px;
  color:#999;
  cursor:pointer;
  text-align:left;
  font:400 12px/1.35 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-files button::before{content:"›  ◇ ";color:#666}
.content-architecture-page .cap-files button:hover,
.content-architecture-page .cap-files button[data-active="true"]{background:#2a2a2a;color:#fff}
.content-architecture-page .cap-editor{display:grid;min-width:0;min-height:0;grid-template-rows:38px 1fr 200px}
.content-architecture-page .cap-editor-tab{
  display:flex;
  align-items:center;
  border-bottom:1px solid var(--cap-line);
  padding:0 16px;
  color:#777;
  font:400 12px/1 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-editor textarea{
  min-width:0;
  min-height:0;
  resize:none;
  border:0;
  outline:0;
  background:
    linear-gradient(90deg,transparent calc(100% - 64px),rgba(255,255,255,.035) calc(100% - 64px)),
    repeating-linear-gradient(to bottom,transparent 0 7px,rgba(255,255,255,.07) 7px 8px) right 10px top 6px/48px 96% no-repeat,
    #191919;
  padding:18px 72px 14px 58px;
  color:#bcbcbc;
  font:400 13px/1.7 CapMono,monospace;
  white-space:pre;
}
.content-architecture-page .cap-terminal{display:flex;min-height:0;flex-direction:column;border-top:1px solid var(--cap-line)}
.content-architecture-page .cap-terminal-title{padding:7px 16px;border-bottom:1px solid var(--cap-line);color:#6f6f6f;font:400 10px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-terminal-output{flex:none;overflow:auto;padding:10px 16px 2px;color:#898989;font:400 10px/1.45 CapMono,monospace;white-space:pre-wrap}
.content-architecture-page .cap-terminal-line{display:flex;align-items:center;padding:0 16px 10px;color:#aaa;font:400 10px/1 CapMono,monospace}
.content-architecture-page .cap-terminal-line input{min-width:0;flex:1;border:0;outline:0;background:transparent;color:#eee}
.content-architecture-page .cap-ide-status{
  display:flex;
  height:26px;
  flex:none;
  align-items:center;
  justify-content:space-between;
  border-top:1px solid var(--cap-line);
  border-radius:0 0 4px 4px;
  background:#222;
  padding:0 16px;
  color:#777;
  font:400 11px/1 CapMono,monospace;
  text-transform:uppercase;
}

.content-architecture-page .cap-showcase{padding:160px 80px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-showcase-head{display:flex;flex-direction:column;gap:16px;margin-bottom:80px}
.content-architecture-page .cap-showcase h2{font-size:44px;font-weight:500;letter-spacing:-.04em;line-height:1.1}
.content-architecture-page .cap-showcase-head p{max-width:600px;color:#aaa;font-size:16px;line-height:1.32}
.content-architecture-page .cap-project-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:64px 24px}
.content-architecture-page .cap-project{display:block;min-width:0}
.content-architecture-page .cap-project-media{
  position:relative;
  aspect-ratio:16/9;
  overflow:hidden;
  background:#1b1b1b;
}
.content-architecture-page .cap-project-media>.cap-glyph-field{position:absolute;inset:0;z-index:1;transition:opacity .5s ease-out}
.content-architecture-page .cap-project-media>img{
  pointer-events:none;
  position:absolute;
  inset:0;
  width:100%;
  height:100%;
  object-fit:cover;
  opacity:0;
  transition:opacity .5s ease-out;
}
.content-architecture-page .cap-project:hover .cap-project-media>.cap-glyph-field,
.content-architecture-page .cap-project:focus-visible .cap-project-media>.cap-glyph-field{opacity:0}
.content-architecture-page .cap-project:hover .cap-project-media>img,
.content-architecture-page .cap-project:focus-visible .cap-project-media>img{opacity:1}
.content-architecture-page .cap-project h3{margin-top:12px;font:400 12px/1 CapMono,monospace;text-transform:uppercase}

.content-architecture-page .cap-testimonials{padding:72px 0 160px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-testimonial-viewport{overflow:hidden}
.content-architecture-page .cap-testimonial-track{
  display:flex;
  gap:16px;
  padding-inline:80px;
  transform:translateX(calc(var(--cap-testimonial-index) * (-55vw - 16px)));
  transition:transform .7s cubic-bezier(.23,1,.32,1);
}
.content-architecture-page .cap-testimonial-slide{width:55vw;min-width:55vw;height:642px}
.content-architecture-page .cap-testimonial-frame{
  position:relative;
  height:100%;
  border:8px solid transparent;
  border-radius:8px;
  background:
    linear-gradient(#181818,#181818) padding-box,
    repeating-conic-gradient(rgba(255,255,255,.22) 0 25%,transparent 0 50%) border-box 0/4px 4px;
  padding:48px;
  box-shadow:inset 0 0 0 1px rgba(255,255,255,.1);
}
.content-architecture-page .cap-testimonial-frame blockquote{font-size:44px;font-weight:400;letter-spacing:-.04em;line-height:1.1}
.content-architecture-page .cap-typing-quote{white-space:pre-wrap}
.content-architecture-page .cap-typewriter-rest{color:transparent}
.content-architecture-page .cap-typewriter-cursor{position:relative;display:inline}
.content-architecture-page .cap-typewriter-cursor::after{
  content:"";
  position:absolute;
  top:.1em;
  left:0;
  width:.1em;
  height:1.05em;
  background:currentColor;
  animation:cap-cursor .9s steps(1,end) infinite;
}
.content-architecture-page .cap-testimonial-meta{position:absolute;right:48px;bottom:48px;left:48px;display:flex;align-items:end;justify-content:space-between}
.content-architecture-page .cap-person{display:flex;align-items:center;gap:14px;font:400 11px/1.35 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-person img{width:48px;height:48px;border-radius:50%;object-fit:cover;filter:grayscale(1)}
.content-architecture-page .cap-slider-controls{display:flex;align-items:center;justify-content:center;gap:16px;margin-top:64px}
.content-architecture-page .cap-slider-controls button{width:44px;height:44px;border:0;background:transparent;color:rgba(255,255,255,.5);cursor:pointer;font-size:18px}
.content-architecture-page .cap-slider-controls button:disabled{color:rgba(255,255,255,.15);cursor:default}
.content-architecture-page .cap-slider-count{margin:0 16px;font:400 12px/1 CapMono,monospace}

.content-architecture-page .cap-pricing{padding:160px 0}
.content-architecture-page .cap-pricing-grid{display:grid;grid-template-columns:457px 552px;gap:111px}
.content-architecture-page .cap-pricing h2{font-size:44px;font-weight:500;letter-spacing:-.04em;line-height:1.1}
.content-architecture-page .cap-price-card{display:flex;flex-direction:column;background:transparent;color:#fff}
.content-architecture-page .cap-price{height:104px;border-radius:8px;background:var(--cap-ink);padding:32px;font-size:44px}
.content-architecture-page .cap-inclusions{min-height:268px;margin-top:4px;border-radius:8px;background:var(--cap-ink);padding:32px}
.content-architecture-page .cap-inclusion{display:grid;grid-template-columns:40px 1fr;gap:8px;padding:4px 0;font:400 11px/1.25 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-inclusion span:first-child{color:#666}
.content-architecture-page .cap-price-actions{height:112px;margin-top:4px;border-radius:8px;background:var(--cap-ink);padding:32px}

.content-architecture-page .cap-faq{padding:160px 80px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-faq-grid{display:grid;grid-template-columns:393px 647px;gap:80px}
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
  padding:24px 0;
  color:#fff;
  cursor:pointer;
  text-align:left;
  font:400 14px/1.35 CapMono,monospace;
  text-transform:uppercase;
}
.content-architecture-page .cap-faq-plus{display:grid;width:18px;height:18px;place-items:center;background:#303030}
.content-architecture-page .cap-faq-answer{overflow:hidden}
.content-architecture-page .cap-faq-answer p{max-width:647px;padding:0 46px 24px 0;color:#a9a9a9;font-size:16px;line-height:1.38;white-space:pre-line}

.content-architecture-page .cap-ascii-banner{padding:80px;background:var(--cap-paper)}
.content-architecture-page .cap-ascii-banner pre{
  height:361px;
  overflow:hidden;
  border:1px solid var(--cap-ink);
  border-radius:5px;
  background:#202020;
  padding:16px 24px;
  color:#fff;
  font:500 10px/1 CapMono,monospace;
  white-space:pre;
}
.content-architecture-page .cap-footer{position:sticky;bottom:0;z-index:0;isolation:isolate;overflow:hidden;padding:90px 80px 60px;background:var(--cap-ink);color:#fff}
.content-architecture-page .cap-footer>.cap-glyph-field{position:absolute;inset:0;z-index:0}
.content-architecture-page .cap-footer-grid{position:relative;z-index:1;display:grid;grid-template-columns:1fr auto;gap:60px;align-items:start}
.content-architecture-page .cap-newsletter{display:flex;max-width:500px;border:1px solid rgba(255,255,255,.2);border-radius:6px;padding:4px}
.content-architecture-page .cap-newsletter input{min-width:0;flex:1;border:0;outline:0;background:transparent;padding:0 12px;color:#fff;font:400 11px/1 CapMono,monospace}
.content-architecture-page .cap-newsletter button{border:0;border-radius:4px;background:var(--cap-paper);padding:12px 18px;color:var(--cap-ink);cursor:pointer;font:400 10px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-footer-links{display:grid;gap:7px;text-align:right;font:400 11px/1 CapMono,monospace;text-transform:uppercase}
.content-architecture-page .cap-footer-bottom{position:relative;z-index:1;display:flex;justify-content:space-between;margin-top:100px;color:#aaa;font:400 10px/1.4 CapMono,monospace;text-transform:uppercase}

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

@media (min-width:901px){
  .content-architecture-page .cap-hero{grid-template-columns:repeat(12,minmax(0,1fr));column-gap:16px}
  .content-architecture-page .cap-hero-copy{grid-column:1/span 6}
  .content-architecture-page .cap-hero-art{grid-column:7/span 6}
  .content-architecture-page .cap-problems{height:662px}
  .content-architecture-page .cap-features{height:3252px;overflow:hidden}
  .content-architecture-page .cap-showcase{height:2885px;overflow:hidden}
  .content-architecture-page .cap-testimonials{height:982px;overflow:hidden}
  .content-architecture-page .cap-pricing{height:812px;overflow:hidden}
  .content-architecture-page .cap-faq{min-height:1503px}
  .content-architecture-page .cap-ascii-banner{height:519px;min-height:0;overflow:hidden}
  .content-architecture-page .cap-footer{min-height:415px}
}

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
  .content-architecture-page .cap-studio-field-overlay{display:none}
  .content-architecture-page .cap-more{right:8px;bottom:8px}
  .content-architecture-page .cap-hero{height:calc(148svh + 3px);grid-template-columns:1fr;grid-template-rows:auto 80svh;overflow:hidden}
  .content-architecture-page .cap-scroll-cue{display:none}
  .content-architecture-page .cap-hero-copy{min-height:68svh;justify-content:end;padding:150px 16px 48px}
  .content-architecture-page .cap-hero h1{margin-top:24px;font-size:40px;line-height:1}
  .content-architecture-page .cap-hero-deck{margin-top:30px;font-size:14px;line-height:1.25}
  .content-architecture-page .cap-audience{font-size:11px}
  .content-architecture-page .cap-hero-cta{margin-top:32px}
  .content-architecture-page .cap-specs{display:none}
  .content-architecture-page .cap-spiral{inset:0}
  .content-architecture-page .cap-problems{height:776px;overflow:hidden;padding:72px 0}
  .content-architecture-page .cap-problem-layout{grid-template-columns:1fr;gap:36px}
  .content-architecture-page .cap-problem-table{max-height:225px;overflow:hidden}
  .content-architecture-page .cap-problem-copy h2{font-size:32px}
  .content-architecture-page .cap-problem-copy p{margin-top:18px;font-size:13px}
  .content-architecture-page .cap-features{height:2486px;overflow:hidden;padding:72px 16px 64px}
  .content-architecture-page .cap-features>.cap-container{width:100%;margin:0}
  .content-architecture-page .cap-features-intro{gap:32px;margin-bottom:80px}
  .content-architecture-page .cap-features-intro h2{font-size:32px}
  .content-architecture-page .cap-features-intro p{font-size:14px}
  .content-architecture-page .cap-feature-grid{width:100%;gap:64px}
  .content-architecture-page .cap-feature,
  .content-architecture-page .cap-feature:nth-child(3n+2),
  .content-architecture-page .cap-feature:nth-child(3n){width:100%;min-height:0;margin-left:0;padding:0}
  .content-architecture-page .cap-feature h3{font-size:14px}
  .content-architecture-page .cap-feature p{margin-top:12px;font-size:14px}
  .content-architecture-page .cap-repo{height:100svh;padding:72px 16px}
  .content-architecture-page .cap-ide-main{grid-template-columns:96px 1fr}
  .content-architecture-page .cap-files button{padding-inline:8px;font-size:8px;overflow:hidden;text-overflow:ellipsis}
  .content-architecture-page .cap-editor{grid-template-rows:1fr 180px}
  .content-architecture-page .cap-editor textarea{font-size:9px}
  .content-architecture-page .cap-showcase{padding:72px 16px}
  .content-architecture-page .cap-showcase-head{grid-template-columns:1fr;gap:28px;margin-bottom:72px}
  .content-architecture-page .cap-showcase h2{font-size:44px}
  .content-architecture-page .cap-project-grid{grid-template-columns:1fr;gap:32px}
  .content-architecture-page .cap-showcase{height:3259px;overflow:hidden}
  .content-architecture-page .cap-testimonials{height:548px;overflow:hidden;padding:72px 0}
  .content-architecture-page .cap-testimonial-track{gap:6px;padding-inline:16px;transform:translateX(calc(var(--cap-testimonial-index) * (-90vw - 6px)))}
  .content-architecture-page .cap-testimonial-slide{width:90vw;min-width:90vw;height:auto}
  .content-architecture-page .cap-testimonial-frame{min-height:312px;padding:30px 24px 24px}
  .content-architecture-page .cap-testimonial-frame blockquote{font-size:16px;line-height:1.25;letter-spacing:0}
  .content-architecture-page .cap-testimonial-meta{right:24px;bottom:24px;left:24px;align-items:start;flex-direction:column;gap:20px}
  .content-architecture-page .cap-slider-controls{margin-top:48px}
  .content-architecture-page .cap-pricing{height:714px;overflow:hidden;padding:48px 0}
  .content-architecture-page .cap-pricing-grid{grid-template-columns:1fr;gap:32px}
  .content-architecture-page .cap-pricing h2{font-size:44px}
  .content-architecture-page .cap-price{padding-block:16px}
  .content-architecture-page .cap-inclusions{padding-block:16px}
  .content-architecture-page .cap-price-actions{padding-block:14px 20px}
  .content-architecture-page .cap-faq{height:1644px;min-height:0;overflow:hidden;padding:72px 16px}
  .content-architecture-page .cap-faq-grid{grid-template-columns:1fr;gap:48px}
  .content-architecture-page .cap-faq-cta{margin-top:32px}
  .content-architecture-page .cap-ascii-banner{height:298px;min-height:0;overflow:hidden;padding:72px 16px}
  .content-architecture-page .cap-ascii-banner pre{font-size:5px}
  .content-architecture-page .cap-footer{padding:72px 16px 44px}
  .content-architecture-page .cap-footer-grid{grid-template-columns:1fr;gap:56px}
  .content-architecture-page .cap-footer-links{text-align:left}
  .content-architecture-page .cap-footer-bottom{margin-top:72px;align-items:flex-start;flex-direction:column;gap:10px}
}

@media (prefers-reduced-motion:reduce){
  .content-architecture-page *{scroll-behavior:auto!important}
}
`;
}
