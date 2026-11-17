// BLANK — aryank.space
// Stylesheet for the colourist reel page, ported from the source's
// styled-components output. Every rule keeps the source's specificity: the
// global type and reset rules are scoped with `:where(.cr-root)` so they stay at
// element weight, and each styled component becomes one class. Viewport units
// become container units on the root, so the page fits whatever box hosts it
// and matches the source exactly when that box is the viewport.

const ROOT = ":where(.cr-root)";
const scope = (selectors: string[]) =>
  selectors.map((s) => `${ROOT} ${s}`).join(",");

const TYPE_SELECTORS = [
  "h1",
  ".type-h1",
  "h2",
  ".type-h2",
  "h3",
  ".type-h3",
  "h4",
  ".type-h4",
  "p",
  ".type-p",
  "a",
  "button",
  "div",
];

const TP = "(max-width: 768px)";
const MOBILE = "(max-width: 550px)";
const EASE = "var(--transition-speed-default) var(--transition-ease)";

export function getColouristReelPageStyles(assetBase: string) {
  const base = assetBase.replace(/\/$/, "");
  return `
@font-face{font-family:"Booton Medium";src:url("${base}/booton-medium.woff2") format("woff2");font-display:swap}
@keyframes cr-bounce{0%,100%{transform:translateX(-50%) translateY(0)}50%{transform:translateX(-50%) translateY(3px)}}

.cr-root{--colour-white:#ffffff;--colour-off-white:#f2f2f2;--colour-light-grey:#999999;--colour-mid-grey:#666666;--colour-dark-grey:#404040;--colour-off-black:#121212;--colour-black:#000000;--font-booton:"Booton Medium";--transition-speed-default:200ms;--transition-speed-fast:100ms;--transition-speed-extra-fast:100ms;--transition-speed-slow:500ms;--transition-speed-extra-slow:800ms;--transition-ease:cubic-bezier(0.65,0,0.35,1);
position:relative;width:100%;height:100%;overflow:hidden;transform:translateZ(0);container-type:size;font-family:var(--font-booton);color:var(--colour-black);line-height:normal;text-align:left;font-size:16px;background:var(--colour-white);transition:all 1500ms var(--transition-ease)}
.cr-root[data-dark="true"]{background:var(--colour-black)}

${ROOT},${ROOT} *{-webkit-font-smoothing:antialiased;-moz-osx-font-smoothing:grayscale;box-sizing:border-box;margin:0;padding:0;border:none;list-style:none;background:none;outline:none;border-radius:0;box-shadow:none;-ms-overflow-style:none;scrollbar-width:none}
${ROOT} *::-webkit-scrollbar{display:none}
${ROOT} ::selection{background-color:black;color:white}
${scope(["input", "textarea", "select", "button", "label"])}{font-family:var(--font-booton);color:var(--colour-black);line-height:normal}
${scope(["strong", "b"])}{font-weight:900}
${ROOT} em{font-style:italic}
${ROOT} a{text-decoration:underline;color:var(--colour-black)}
${ROOT} button{cursor:pointer;border:none;outline:none;background:none;-webkit-tap-highlight-color:transparent}
${ROOT} button:focus{outline:none}
${ROOT} button:focus-visible{outline:none}
${scope(TYPE_SELECTORS)}{font-size:.875rem;line-height:1.25rem;font-weight:400}
@media ${TP}{${scope(TYPE_SELECTORS)}{font-size:.75rem;line-height:1.125rem}}
${scope(TYPE_SELECTORS.map((s) => `${s} *`))}{font-size:.875rem;line-height:1.25rem;font-weight:400}
@media ${TP}{${scope(TYPE_SELECTORS.map((s) => `${s} *`))}{font-size:.75rem;line-height:1.125rem}}
${ROOT} .type-small{font-size:.75rem;line-height:1.125rem}
${ROOT} .type-small *{font-size:.75rem;line-height:1.125rem}
${ROOT} .tile-button{height:2.125rem;width:2.125rem;display:flex;align-items:center;justify-content:center;font-size:.75rem;line-height:.625rem;color:var(--colour-mid-grey);background:var(--colour-off-white);border-radius:.25rem;position:relative;transition:all ${EASE}}
@media ${TP}{${ROOT} .tile-button{height:2rem;width:2rem}}
${ROOT} .performance{-webkit-transform:translateZ(0);backface-visibility:hidden;perspective:1000px;transform:translateZ(0)}
${scope(["img", "video"])}{max-width:100%;display:block;height:auto}

.cr-lwrap{margin:0 auto;padding:0 1rem}
.cr-lgrid{display:grid;grid-template-columns:repeat(12,minmax(0,1fr));grid-column-gap:1rem;align-items:start}
@media ${TP}{.cr-lgrid{grid-template-columns:repeat(6,minmax(0,1fr))}}
.cr-tz{white-space:nowrap}
.cr-dash{display:inline-block;width:1em;height:1px;vertical-align:.32em;background:currentColor}

.cr-colour{transition:color .2s ease}

.cr-info-screen{top:0;left:0;height:100cqh;width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;overflow:auto}
.cr-info-inner{display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:22.5rem}
.cr-info-cell *{color:var(--colour-mid-grey);text-decoration:none;text-align:center;transition:all ${EASE}}
.cr-info-cell a{transition:all ${EASE}}
.cr-info-cell:hover a{color:var(--colour-off-black)!important}
.cr-info-top{display:flex;flex-direction:column;align-items:center;justify-content:center;margin-bottom:1.5rem}
.cr-info-desc{margin-bottom:1.5rem}
.cr-info-desc p{text-align:center;color:var(--colour-mid-grey)}
.cr-info-desc a{color:var(--colour-mid-grey);transition:all ${EASE}}
.cr-info-desc a:hover{color:var(--colour-off-black)}
.cr-info-tzrow{margin-bottom:1.5rem;display:flex;align-items:center;gap:.25rem}
.cr-info-tzrow *{color:var(--colour-mid-grey)}
.cr-info-logos{display:flex;flex-direction:row;align-items:center;justify-content:center;gap:1.5rem;margin-bottom:1.5rem}
.cr-info-logo{width:auto;max-height:1.5rem;max-width:3.75rem;object-fit:contain}
.cr-info-footer{display:flex;flex-direction:column;align-items:center;justify-content:center;color:var(--colour-mid-grey)}
.cr-info-footer a{color:var(--colour-mid-grey);transition:all ${EASE}}
.cr-info-footer a:hover{color:var(--colour-off-black)}

@media ${TP}{.cr-carousel{display:none}}
.cr-embla-pe-on *{pointer-events:auto!important}
.cr-embla-pe-off *{pointer-events:none!important}
.cr-embla-container{padding:50px;display:flex;flex-direction:column;height:100%;gap:.125rem}
.cr-slide{flex:0 0 9.09%;min-height:0;text-align:center;display:flex;justify-content:center;align-items:center;gap:.375rem;transition:opacity .06s linear;cursor:pointer}
.cr-slide-desktop{opacity:0}
.cr-slide>.tile-slot{width:0;height:.75rem;overflow:hidden;display:flex;align-items:center;justify-content:center;flex:0 0 auto;transition:width .18s ease}
.cr-slide[data-center="true"]>.tile-slot{width:.75rem}
.cr-slide>.tile-slot [data-tile]{opacity:0;transition:opacity .15s ease;transition-delay:0s}
.cr-slide[data-center="true"]>.tile-slot [data-tile]{opacity:1;transition-delay:.18s}
.cr-slide span{white-space:pre}
.cr-slide-content{display:flex;align-items:center;gap:.25rem;transition:gap .16s ease-in-out}
.cr-slide-content span{color:var(--cr-slide-colour);font-size:.9375rem!important;line-height:1.5;transition:all var(--transition-speed-extra-slow) var(--transition-ease)}
@media ${TP}{.cr-slide-content span{font-size:.75rem!important}}
.cr-slide-content span:nth-child(2){opacity:.4}
.cr-tile{width:.75rem;height:.75rem;border-radius:.125rem;opacity:0;transition:opacity .2s ease-in-out}
.cr-tile-slot{width:0;height:.75rem;display:flex;align-items:center;justify-content:center;overflow:hidden}

.cr-mcarousel{display:none}
@media ${TP}{.cr-mcarousel{display:block;padding-bottom:15%}}
@media ${MOBILE}{.cr-mcarousel{padding-bottom:calc(56.25% - 32px)}}
.cr-mslide-content{display:flex;align-items:center;justify-content:center;gap:.25rem}
.cr-mslide-content span{color:var(--cr-slide-colour);max-width:320px;transition:all var(--transition-speed-slow) var(--transition-ease)}
.cr-mslide-content span:nth-child(2){opacity:.4;text-overflow:ellipsis;overflow:hidden;max-width:200px}

.cr-grid-card{cursor:pointer;grid-column:span 4}
@media ${TP}{.cr-grid-card{grid-column:span 3}}
.cr-grid-media{position:relative;width:100%;padding-top:56.25%;margin-bottom:.75rem}
.cr-grid-media-inner{position:absolute;inset:0;width:100%;height:100%;overflow:hidden;border-radius:.125rem}
.cr-grid-media-inner img,.cr-grid-media-inner video{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover}
.cr-grid-media-layer{position:absolute;inset:0;width:100%;height:100%;z-index:2}
.cr-grid-title{color:var(--colour-off-black);display:flex;gap:.25rem}
.cr-grid-title span:first-child:last-child{color:var(--colour-off-black)}
.cr-grid-title span:last-child:not(:first-child){color:var(--colour-light-grey)}
.cr-grid-type{text-transform:capitalize;color:var(--colour-light-grey)}
.cr-grid{width:100%;transition:all 750ms var(--transition-ease)}
.cr-grid .cr-lgrid{grid-row-gap:2.5rem}
.cr-grid-pad{padding:0 15cqw}

.cr-filters{position:fixed;top:1.5rem;left:50%;transform:translateX(-50%);z-index:20;display:flex;justify-content:center;align-items:center;gap:.125rem;background:rgba(255,255,255,0);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);border-radius:.25rem;padding:.25rem .5rem;transition:all 500ms var(--transition-ease)}
@media ${TP}{.cr-filters{display:none}}
.cr-filter{pointer-events:all;height:2.125rem;width:auto;padding:0 .5rem;display:flex;align-items:center;justify-content:center;border-radius:.25rem;position:relative;transition:all ${EASE}}
.cr-filter:hover span{color:var(--colour-mid-grey)}
.cr-filter span{position:relative;z-index:2;transition:all ${EASE}}
.cr-tile-bg{position:absolute;top:0;left:0;width:100%;height:100%;background-color:var(--colour-off-white);border-radius:.25rem;z-index:1}

.cr-projects{position:fixed;top:0;left:0;width:100%;height:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:none;overflow:hidden}
@media ${TP}{.cr-projects{z-index:5!important}}
.cr-list{top:0;left:0;width:100%;height:50cqh;display:flex;flex-direction:column;justify-content:center;align-items:center;position:relative;overflow:auto}
@media ${TP}{.cr-list{height:100cqh}}
.cr-gridwrap{position:fixed;top:0;left:0;width:100%;height:100cqh;overflow:auto;touch-action:pan-y;padding:25cqh 0}
.cr-projects-inner{transition:opacity .5s ease;position:relative;z-index:15}

.cr-home{position:fixed;top:0;left:0;height:100cqh;width:100%;display:flex;flex-direction:column;justify-content:center;align-items:center;pointer-events:none}
.cr-home-content{display:flex;flex-direction:column;align-items:center;justify-content:center;max-width:23.75rem;transition:opacity var(--transition-speed-slow) var(--transition-ease)}
@media ${MOBILE}{.cr-home-content{padding-bottom:calc(56.25% - 32px);padding-left:1rem;padding-right:1rem}}
.cr-home-title{color:var(--colour-off-black);text-align:center}
.cr-home-sub{color:var(--colour-light-grey);text-align:center}

.cr-navbtn{pointer-events:all}
@media ${TP}{.cr-navbtn.tile-button{width:auto;padding:0 .5rem}}
.cr-navbtn:hover{background:var(--colour-off-black);color:var(--colour-off-white)}
@media ${TP}{.cr-navbtn:hover{color:var(--colour-mid-grey);background:var(--colour-off-white)}}
.cr-navbtn:hover .hint{opacity:1;transform:translateY(-50%) translateX(4px)}
.cr-navbtn[data-left="true"]:hover .hint{transform:translateY(-50%) translateX(-4px)}
.cr-navhint{font-size:.75rem;line-height:.625rem;color:var(--colour-mid-grey);position:absolute;top:50%;transform:translateY(-50%) translateX(0);left:calc(100% + 8px);opacity:.4;pointer-events:none;transition:all ${EASE}}
.cr-navhint[data-left="true"]{left:auto;right:calc(100% + 8px)}
@media ${TP}{.cr-navhint{display:none}}

.cr-esc{pointer-events:all;backdrop-filter:blur(10px)}
.cr-esc.tile-button{background:var(--colour-off-white);color:var(--colour-mid-grey)}
.cr-esc[data-dark="true"]{border:1px solid rgba(238,238,238,.1)}
.cr-esc[data-dark="true"].tile-button{background:rgba(238,238,238,.05);color:var(--colour-off-white)}
.cr-esc:hover{background:var(--colour-off-white);color:var(--colour-off-black)}
@media ${TP}{.cr-esc:hover{color:var(--colour-mid-grey);background:var(--colour-off-white)}}
.cr-esc:hover .hint{opacity:1;transform:translateY(-50%) translateX(4px)}
.cr-esc[data-left="true"]:hover .hint{transform:translateY(-50%) translateX(-4px)}
.cr-eschint{font-size:.75rem;line-height:.625rem;color:var(--colour-mid-grey);position:absolute;top:50%;transform:translateY(-50%) translateX(0);left:calc(100% + 8px);opacity:0;pointer-events:none;transition:all ${EASE}}
.cr-eschint[data-dark="true"]{color:var(--colour-off-white)}
.cr-eschint[data-left="true"]{left:auto;right:calc(100% + 8px)}
@media ${TP}{.cr-eschint{display:none}}

.cr-layout{display:flex;justify-content:space-between;align-items:center;padding:0 1.5rem}
.cr-layout-info{justify-content:flex-end}
@media ${TP}{.cr-layout{align-items:flex-start;justify-content:flex-end;padding:.75rem}.cr-layout-gap{gap:.5rem}}

.cr-views{display:flex;flex-direction:column;justify-content:center;align-items:center;gap:.25rem}
@media ${TP}{.cr-views{display:none}}
.cr-view{pointer-events:all;height:2.125rem;width:2.125rem;display:flex;align-items:center;justify-content:center;border-radius:.25rem;position:relative;transition:all ${EASE}}
.cr-view svg{position:relative;z-index:2}
.cr-view svg path{stroke:var(--cr-view-stroke);transition:all ${EASE}}
.cr-view:hover .hint{opacity:1;transform:translateY(-50%) translateX(-4px)}
.cr-view-light:hover svg path{stroke:var(--colour-off-black)}
.cr-view-dark:hover svg path{stroke:var(--colour-off-white)}
.cr-viewhint{font-size:.75rem;line-height:.625rem;color:var(--colour-mid-grey);position:absolute;top:50%;transform:translateY(-50%) translateX(0);right:calc(100% + 8px);opacity:0;pointer-events:none;transition:all ${EASE}}
.cr-view-dark .cr-viewhint{color:var(--colour-off-white)}

.cr-header{position:fixed;top:50%;transform:translateY(-50%);left:0;width:100%;z-index:100;pointer-events:none}
.cr-header>div{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;height:100%;pointer-events:auto}
@media ${TP}{.cr-header{top:10px;transform:translateY(0)}}

.cr-logo{position:fixed;top:0;left:50%;transform:translateX(-50%);z-index:100;display:flex;justify-content:center;align-items:center;gap:.25rem;padding:1rem;color:var(--colour-light-grey);opacity:var(--cr-logo-op);pointer-events:var(--cr-logo-pe);transition:all ${EASE}}
@media ${TP}{.cr-logo{left:0;transform:translateX(0);padding:1.125rem 1rem}}
@media ${TP}{.cr-logo{opacity:1}}
.cr-logo-cell *{color:var(--colour-light-grey);text-decoration:none;transition:all ${EASE}}
.cr-logo-cell:hover a{color:var(--colour-off-black)}
.cr-logo-btn{transition:all ${EASE}}
.cr-logo-btn:hover{color:var(--colour-off-black)}
.cr-logo-info{display:flex;align-items:center;gap:.25rem}

.cr-mute{height:2.5rem;width:2.5rem;display:flex;align-items:center;justify-content:center;border-radius:.25rem;transition:all ${EASE}}
.cr-mute>div{display:flex;align-items:center;justify-content:center}
.cr-mute svg path{transition:all ${EASE}}
.cr-mute:hover{background:var(--colour-off-white)}
.cr-mute:hover svg path{stroke:var(--colour-off-black)}
.cr-seek{flex:1;width:200px;height:100%;display:flex;align-items:center}
.cr-seek-inner{position:relative;width:200px;height:15px;cursor:pointer}
.cr-seek-full{position:absolute;top:50%;left:0;transform:translateY(-50%);z-index:1;background:var(--colour-white);opacity:.5;width:100%;height:1px}
.cr-seek-current{top:50%;left:0;transform:translateY(-50%);z-index:2;background:var(--colour-white);height:3px;position:relative;will-change:width;transition:width 600ms linear}
.cr-time{display:flex;align-items:center;justify-content:center;column-gap:.25rem;padding:0 .75rem}
@media ${TP}{.cr-time{display:none}}
.cr-time span{font-size:.6875rem;line-height:1;font-weight:400;text-transform:uppercase;min-width:35px;text-align:center}
.cr-controls-panel{height:100%;margin:0 auto;flex:1;display:flex;justify-content:center;align-items:center;gap:.5rem}
.cr-controls{position:absolute;bottom:40px;left:50%;transform:translate(-50%,-50%);z-index:4;color:var(--colour-white)}
@media ${TP}{.cr-controls{bottom:50%;transform:translate(-50%,50%)}}
.cr-controls-inner{height:100%;display:flex;position:relative;justify-content:center;padding:.25rem;background:rgba(253,253,253,.05);border:1px solid rgba(253,253,253,.1);backdrop-filter:blur(10px);border-radius:.25rem}

.cr-hint{opacity:var(--cr-hint-op)!important;position:absolute;bottom:calc(100% + 16px);left:50%;transform:translateX(-50%);color:var(--colour-light-grey);display:flex;flex-direction:column;align-items:center;text-align:center;mix-blend-mode:difference;transition:all .3s ease}
@media ${TP}{.cr-hint{display:none}}
.cr-hint-line{width:5rem;height:.125rem;background:var(--colour-black);border-radius:.125rem;margin-top:.25rem}

.cr-player{position:absolute;display:flex;align-items:center;justify-content:center;width:100cqw;height:100%;transform:var(--cr-pl-tf);top:0;z-index:10;will-change:transform;transition:all 1000ms var(--transition-ease);transition-delay:var(--cr-pl-delay)}
@media ${MOBILE}{.cr-player{bottom:var(--cr-pl-mbottom);top:unset;transform:var(--cr-pl-mtf);height:unset}}
.cr-player video.cr-video{width:100%;height:100%;max-width:none;object-fit:cover;aspect-ratio:16/9;position:relative;z-index:1;border-radius:var(--cr-pl-radius);overflow:hidden;transition:border-radius 1000ms var(--transition-ease)}
@media ${MOBILE}{.cr-player video.cr-video{border-radius:0}}
.cr-player-inner{height:100%;position:absolute;top:0;transform:translateY(0);will-change:transform,width;transition:all 1000ms var(--transition-ease)}
.cr-player-inner .player-motion-wrapper{height:100%;display:flex;justify-content:center;align-items:flex-start}
@media ${MOBILE}{.cr-player-inner .player-motion-wrapper{align-items:flex-end}}
@media ${MOBILE}{.cr-player-inner{position:relative;top:unset;bottom:unset;transform:translateY(0);width:100cqw!important}}
.cr-player-inner:hover{transform:var(--cr-pl-peek)}
@media ${MOBILE}{.cr-player-inner:hover{transform:translateY(0)}}
.cr-player-inner:hover .showreel-hint{opacity:var(--cr-pl-hint-hover)!important;animation:cr-bounce .5s ease-in-out}
.cr-backdrop{position:relative;width:100%;transition:transform 1000ms var(--transition-ease),filter 500ms var(--transition-ease)}
@media ${MOBILE}{.cr-backdrop{display:flex;align-items:flex-end;transform:none!important}}
.cr-ambient{position:absolute;top:0;left:0;width:100%;height:100%;z-index:0;transition:opacity 1000ms var(--transition-ease),filter 1000ms var(--transition-ease),transform 1000ms var(--transition-ease)}
.cr-ambient-safari{will-change:transform,opacity;backface-visibility:hidden;-webkit-backface-visibility:hidden}
@media ${MOBILE}{.cr-ambient{filter:blur(35px)!important}}

.cr-gallery{position:fixed;top:0;left:0;width:100%;height:100cqh;background:var(--colour-black);padding:25cqh 0;overflow:auto;z-index:50}
.cr-gallery .cr-lwrap{width:100%}
.cr-gallery .cr-lgrid{grid-row-gap:1.5rem}
.cr-gallery-item{grid-column:4/-4;width:100%}
@media ${TP}{.cr-gallery-item{grid-column:1/-1}}
.cr-gallery-outer{position:relative;width:100%}
.cr-gallery-inner{position:absolute;inset:0;width:100%;height:100%}
.cr-gallery-inner img{position:absolute;inset:0;width:100%;height:100%;max-width:none;object-fit:cover}
.cr-gallery-empty{position:fixed;top:50%;left:50%;transform:translate(-50%,-50%);width:100%;text-align:center;color:var(--colour-white)}

.cr-pinfo{position:absolute;top:0;left:0;width:100%;height:100%;z-index:50;padding:25cqh 0;overflow:hidden;background:var(--colour-black);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:1.5rem}
.cr-pinfo-group{display:flex;flex-direction:column;align-items:center;justify-content:center}
.cr-pinfo-cell{display:flex;gap:1rem}
.cr-pinfo-cell a{text-decoration:underline;color:var(--colour-off-white);flex:1;width:22.5rem}
.cr-pinfo-role{text-align:right;flex:1;color:var(--colour-off-white);width:22.5rem}
.cr-pinfo-title{text-align:left;flex:1;color:var(--colour-off-white);width:22.5rem}
`;
}
