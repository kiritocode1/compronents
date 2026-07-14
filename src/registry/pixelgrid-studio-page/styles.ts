export function getPixelgridStudioPageStyles(): string {
  return `@import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500&display=swap');
.pixelgrid-studio-page{
  --paper:#FFFFFF; --ink:#0A0A0A; --muted:#8b8b8b; --red:#e0492a; --neon:#d8ff00;
  --line:rgba(10,10,10,.12); --line-2:rgba(10,10,10,.06);
  --cell:14px; --gutter:56px; --maxw:1176px; --readw:34ch; --radius:26px;
  --mono:"SFMono-Regular",ui-monospace,Menlo,Consolas,monospace;
  --sneak:"Space Grotesk","Helvetica Neue",Helvetica,Arial,sans-serif;
  display:grid; margin:0; background:var(--paper); color:var(--ink);
  font-family:var(--sneak); font-weight:400; line-height:1.5;
  -webkit-font-smoothing:antialiased;
}
@media(max-width:680px){ .pixelgrid-studio-page{--gutter:28px;} }
.pixelgrid-studio-page *{box-sizing:border-box; -webkit-tap-highlight-color:transparent;}
.pixelgrid-studio-page a{color:inherit;}
.pixelgrid-studio-page .mono{font-family:var(--mono); font-size:11px; letter-spacing:.18em; text-transform:uppercase;}

.pixelgrid-studio-page .pgs-content{position:relative; z-index:1; grid-area:1/1; overflow-x:hidden;}

/* ===== pixel controls (cell / brush size) ===== */
.pixelgrid-studio-page .pxctl{position:absolute; left:16px; bottom:16px; z-index:200; display:none; align-items:center; gap:5px;
  padding:7px 9px; background:rgba(255,255,255,.82); -webkit-backdrop-filter:blur(10px); backdrop-filter:blur(10px);
  border:1px solid rgba(10,10,10,.12); border-radius:10px;
  font-family:var(--mono); font-size:10px; letter-spacing:.1em; text-transform:uppercase;}
.pixelgrid-studio-page .pxctl .lbl{color:var(--muted); margin:0 3px;}
.pixelgrid-studio-page .pxctl .lbl:first-child{margin-left:0;}
.pixelgrid-studio-page .pxctl button{font:inherit; width:22px; height:22px; display:flex; align-items:center; justify-content:center;
  border:1px solid rgba(10,10,10,.16); background:#fff; color:var(--ink); border-radius:6px; cursor:pointer; padding:0; transition:background .15s,border-color .15s;}
.pixelgrid-studio-page .pxctl button:hover{border-color:rgba(10,10,10,.45);}
.pixelgrid-studio-page .pxctl button.on{background:var(--ink); color:#fff; border-color:var(--ink);}
.pixelgrid-studio-page .pxctl{transition:opacity .35s ease, transform .35s ease;}
.pixelgrid-studio-page .pxctl.hide{opacity:0; transform:translateY(8px); pointer-events:none;}

/* ===== hero ===== */
.pixelgrid-studio-page #hero-kv{position:sticky; top:0; width:100%; display:block; grid-area:1/1; z-index:0; pointer-events:none;}
.pixelgrid-studio-page .hero{position:relative; min-height:100vh; background:transparent; z-index:1;}
.pixelgrid-studio-page .hhead{position:relative; z-index:5; background:#fff; padding:0 var(--gutter);}
.pixelgrid-studio-page .hhead::after{content:""; position:absolute; left:0; right:0; bottom:-1px; height:1px; background:var(--line); transform-origin:left; transform:scaleX(0); animation:pgsLineGrowX .9s cubic-bezier(.16,1,.3,1) .5s both;}
.pixelgrid-studio-page .hhead .hgrid{max-width:var(--maxw); margin:0 auto; padding:calc(var(--cell)*2) 0 calc(var(--cell)*2 + 2px); display:grid; grid-template-columns:1fr; gap:calc(var(--cell)*3); align-items:stretch;}
@media(min-width:900px){ .pixelgrid-studio-page .hhead .hgrid{grid-template-columns:1.6fr 1fr;} }
.pixelgrid-studio-page .hhead .hl{margin:0; align-self:start; font-weight:400; text-transform:uppercase; font-size:clamp(32px,5.2vw,82px); line-height:0.92; letter-spacing:-0.035em;}
@keyframes pgsHeroIn{ from{opacity:0; transform:translateY(14px);} to{opacity:1; transform:none;} }
@keyframes pgsHeroLine{ from{transform:translateY(115%);} to{transform:translateY(0);} }
@keyframes pgsLineGrowX{ to{transform:scaleX(1);} }
@keyframes pgsLineGrowY{ to{transform:scaleY(1);} }
.pixelgrid-studio-page .hhead .ln{display:block; overflow:hidden; padding-bottom:.08em; margin-bottom:-.08em;}
.pixelgrid-studio-page .hhead .ln > span{display:block; transform:translateY(115%); animation:pgsHeroLine .95s steps(6) both;}
.pixelgrid-studio-page .hhead .hl .ln:nth-child(1) > span{ animation-delay:.10s; }
.pixelgrid-studio-page .hhead .hl .ln:nth-child(2) > span{ animation-delay:.21s; }
.pixelgrid-studio-page .hhead .hdesc .ln:nth-child(1) > span{ animation-delay:.36s; }
.pixelgrid-studio-page .hhead .hdesc .ln:nth-child(2) > span{ animation-delay:.44s; }
.pixelgrid-studio-page .hhead .htag{ animation:pgsHeroIn .9s steps(6) .58s both; }
.pixelgrid-studio-page .hhead .hfoot img,
.pixelgrid-studio-page .hhead .hfoot svg{ animation:pgsHeroIn .9s steps(6) .78s both; }
@media(prefers-reduced-motion: reduce){ .pixelgrid-studio-page .hhead .ln > span{ animation:none; transform:none; } .pixelgrid-studio-page .hhead .htag, .pixelgrid-studio-page .hhead .hfoot img{ animation:none; } .pixelgrid-studio-page .hhead::after{ animation:none; transform:scaleX(1); } .pixelgrid-studio-page .hcol::before{ animation:none; transform:scaleY(1); } }
.pixelgrid-studio-page .hhead .hcol{position:relative; display:flex; flex-direction:column; justify-content:space-between; gap:calc(var(--cell)*2);}
@media(min-width:900px){
  .pixelgrid-studio-page .hhead .hcol{padding-left:calc(var(--cell)*3);}
  .pixelgrid-studio-page .hhead .hcol::before{content:""; position:absolute; left:0; top:calc(var(--cell)*-2); bottom:calc(var(--cell)*-2); width:1px; background:var(--line); transform-origin:top; transform:scaleY(0); animation:pgsLineGrowY .85s cubic-bezier(.16,1,.3,1) .42s both;}
}
.pixelgrid-studio-page .hhead .hdesc{margin:0; font-weight:400; text-transform:uppercase; font-size:clamp(13px,1.45vw,20px); line-height:1.18; letter-spacing:-0.01em;}
.pixelgrid-studio-page .hhead .hdesc span{display:block; text-align:justify; text-align-last:justify; -webkit-text-align-last:justify;}
.pixelgrid-studio-page .hhead .hfoot{display:flex; align-items:flex-start; justify-content:space-between; gap:12px; perspective:900px;}
.pixelgrid-studio-page .hhead .hfoot svg{width:34px; height:auto; display:block; flex:none; margin-top:2px;}
.pixelgrid-studio-page .wlogo{display:inline-block; flex:none; transform-origin:50% 50%;}
@keyframes pgsWSpin{ from{transform:rotateY(0);} to{transform:rotateY(360deg);} }
.pixelgrid-studio-page .wlogo:hover, .pixelgrid-studio-page .wlogo.spin{ animation:pgsWSpin .9s steps(18); }
@media(prefers-reduced-motion: reduce){ .pixelgrid-studio-page .wlogo:hover, .pixelgrid-studio-page .wlogo.spin{ animation:none; } }
.pixelgrid-studio-page .hhead .htag{margin:0; font-size:13px; line-height:1.45; max-width:34ch; text-align:right;}

.pixelgrid-studio-page main{position:relative; z-index:2;}
.pixelgrid-studio-page .sheet{position:relative; z-index:2; background:transparent;}
.pixelgrid-studio-page .hero + .sheet{margin-top:clamp(calc(var(--cell)*18),55vh,calc(var(--cell)*38));}
.pixelgrid-studio-page #protocol{padding-bottom:calc(var(--cell)*2.5);}
.pixelgrid-studio-page #protocol-parts{padding-top:calc(var(--cell)*1);}

/* ===== editorial ===== */
.pixelgrid-studio-page section.ed{padding:calc(var(--cell)*9) var(--gutter);}
.pixelgrid-studio-page .ed .wrap{max-width:var(--maxw); margin:0 auto; display:flex; flex-direction:column; gap:calc(var(--cell)*2);}
@media(min-width:860px){ .pixelgrid-studio-page .ed .wrap{display:grid; grid-template-columns:0.82fr 1.18fr; column-gap:calc(var(--cell)*6); row-gap:0; align-items:start;} .pixelgrid-studio-page .ed .head{margin:0;} }
.pixelgrid-studio-page .ed .kick{color:var(--muted); margin:14px 0 0; font-size:10px;}
.pixelgrid-studio-page .ed h2{font-size:clamp(26px,3.4vw,46px); line-height:1.06; letter-spacing:-.02em; font-weight:400; margin:0; max-width:16ch;}
.pixelgrid-studio-page .ed p{font-size:clamp(15px,1.15vw,18px); line-height:1.62; max-width:48ch; margin:0 0 1.05em; color:#2a2a2a; text-align:justify; text-align-last:left;}
.pixelgrid-studio-page .ed p:last-child{margin-bottom:0;} .pixelgrid-studio-page .ed p.s{color:var(--muted); font-size:14px;} .pixelgrid-studio-page .ed strong{font-weight:500; color:var(--ink);}
.pixelgrid-studio-page .two{display:grid; grid-template-columns:1fr; gap:calc(var(--cell)*2); max-width:none; margin:calc(var(--cell)*3.5) 0;}
@media(min-width:560px){ .pixelgrid-studio-page .two{grid-template-columns:1fr 1fr;} }
.pixelgrid-studio-page .two .c{text-align:center;} .pixelgrid-studio-page .two .c .l{color:var(--muted); margin-bottom:7px;} .pixelgrid-studio-page .two .c p{font-size:14px; margin:0; text-wrap:balance; text-align:center; text-align-last:center;}
.pixelgrid-studio-page .two .c{position:relative;}
.pixelgrid-studio-page .two .c .smiley{display:block; width:128px; height:128px; margin:2px auto 18px; transform-origin:50% 58%; will-change:transform; transition:transform .3s ease;}
.pixelgrid-studio-page .two .c .smiley.sm-jump{animation:pgsSmJump .62s cubic-bezier(.3,1.5,.5,1);}
.pixelgrid-studio-page .two .c .smiley.sm-shy{transform:scale(.93) translateY(3px);}
@keyframes pgsSmJump{0%{transform:translateY(0)}28%{transform:translateY(-18px)}52%{transform:translateY(0)}68%{transform:translateY(-7px)}100%{transform:translateY(0)}}
.pixelgrid-studio-page .sm-heart{position:absolute; z-index:6; pointer-events:none; animation:pgsSmHeart 1s ease-out forwards;}
@keyframes pgsSmHeart{0%{opacity:0; transform:translate(-50%,0) scale(.5)}14%{opacity:1}100%{opacity:0; transform:translate(-50%,-72px) scale(1.1)}}
.pixelgrid-studio-page .ed .wrap > .reveal:not(.head) > p{max-width:none;}
.pixelgrid-studio-page #shift p.s, .pixelgrid-studio-page #ai p.s{font-size:clamp(15px,1.15vw,18px); color:#2a2a2a;}

/* ===== springy carousels ===== */
.pixelgrid-studio-page .caro{position:relative; z-index:2; background:transparent; padding:calc(var(--cell)*7) var(--gutter);}
.pixelgrid-studio-page .caro .ch{max-width:var(--maxw); margin:0 auto calc(var(--cell)*2); padding:0; display:flex; justify-content:space-between; align-items:baseline; gap:var(--cell);}
.pixelgrid-studio-page .caro .ch h2{font-size:clamp(26px,3.4vw,46px); line-height:1.06; font-weight:400; letter-spacing:-.02em; margin:0;}
.pixelgrid-studio-page .caro .ch .hint{color:var(--muted); white-space:nowrap;}
.pixelgrid-studio-page .track-wrap{overflow:hidden; margin:0 calc(-1 * var(--gutter)); padding:calc(var(--cell)*3) 0; touch-action:pan-y; user-select:none; -webkit-user-select:none;}
.pixelgrid-studio-page .track-wrap, .pixelgrid-studio-page .track-wrap *{cursor:grab;}
.pixelgrid-studio-page .track-wrap.drag, .pixelgrid-studio-page .track-wrap.drag *{cursor:grabbing !important;}
.pixelgrid-studio-page .track-wrap a{-webkit-user-drag:none;}
.pixelgrid-studio-page .track-wrap{position:relative;}
.pixelgrid-studio-page .sl-arrow{position:absolute; top:calc(var(--cell)*3 + 175px); transform:translateY(-50%); z-index:6; width:42px; height:42px; border:0; background:var(--ink); color:#fff; display:none; align-items:center; justify-content:center; padding:0; cursor:pointer; transition:background .2s ease, opacity .25s ease;
  clip-path:polygon(10px 0, calc(100% - 10px) 0, calc(100% - 10px) 5px, calc(100% - 5px) 5px, calc(100% - 5px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 5px) calc(100% - 10px), calc(100% - 5px) calc(100% - 5px), calc(100% - 10px) calc(100% - 5px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 5px), 5px calc(100% - 5px), 5px calc(100% - 10px), 0 calc(100% - 10px), 0 10px, 5px 10px, 5px 5px, 10px 5px, 10px 0);}
.pixelgrid-studio-page .sl-arrow.prev{left:16px;} .pixelgrid-studio-page .sl-arrow.next{right:16px;}
.pixelgrid-studio-page .sl-arrow svg{width:18px; height:18px;}
.pixelgrid-studio-page .sl-arrow:hover{background:#3b5bd9;}
.pixelgrid-studio-page .sl-arrow[disabled]{opacity:0; pointer-events:none;}
@media(hover:hover) and (pointer:fine){ .pixelgrid-studio-page .sl-arrow{display:flex;} }
.pixelgrid-studio-page .track{display:flex; gap:28px; width:max-content; padding:0 max(var(--gutter), calc((100vw - var(--maxw)) / 2)); will-change:transform;}
.pixelgrid-studio-page .slide{flex:0 0 auto; width:min(78vw,320px); display:flex; flex-direction:column; gap:13px; text-decoration:none; color:inherit;}
.pixelgrid-studio-page .slide .pv{position:relative; border-radius:0; overflow:hidden; background:transparent;}
.pixelgrid-studio-page .slide .pv canvas, .pixelgrid-studio-page .slide .pv video{position:absolute; inset:0; width:100%; height:100%; object-fit:cover; display:block; background:#0A0A0A; pointer-events:none;}
.pixelgrid-studio-page .slide .cap{display:flex; justify-content:space-between; align-items:baseline; gap:10px; padding:0 2px;}
.pixelgrid-studio-page .slide .cap .ti{font-size:16px; font-weight:500; margin:0; letter-spacing:-.01em;} .pixelgrid-studio-page .slide .cap .ds{color:var(--muted);}
.pixelgrid-studio-page .slide.cs{width:min(90vw,420px); display:flex; flex-direction:column; align-items:center; text-align:center; gap:0; padding:0 0 26px; border-radius:0; overflow:visible; background:transparent;}
.pixelgrid-studio-page .slide.cs .csm{position:relative; width:100%; height:350px; overflow:hidden; background:#0A0A0A;}
.pixelgrid-studio-page .slide.cs .csm video, .pixelgrid-studio-page .slide.cs .csm img{width:100%; height:100%; object-fit:cover; display:block; pointer-events:none; transform:scale(1.14);}
.pixelgrid-studio-page .slide.cs .csm canvas{position:absolute; inset:0; width:100%; height:100%; display:block; pointer-events:none;}
.pixelgrid-studio-page .slide.cs .t{font-size:clamp(22px,2.2vw,30px); font-weight:500; letter-spacing:-.02em; margin:20px 0 0;}
.pixelgrid-studio-page .slide.cs .d{color:#2a2a2a; font-size:14.5px; line-height:1.5; margin:9px 26px 0; max-width:32ch;}
.pixelgrid-studio-page .slide.cs .reveal-cta{display:none; position:absolute; inset:0; z-index:2;
  background:linear-gradient(to top, rgba(10,10,10,.8) 0, rgba(10,10,10,.8) 14px, rgba(10,10,10,.52) 14px, rgba(10,10,10,.52) 28px, rgba(10,10,10,.28) 28px, rgba(10,10,10,.28) 42px, rgba(10,10,10,.1) 42px, rgba(10,10,10,.1) 56px, rgba(10,10,10,0) 56px);
  transform:translateY(100%); pointer-events:none; transition:transform .5s steps(4);}
.pixelgrid-studio-page .slide.cs:hover .reveal-cta{transform:translateY(0);}
.pixelgrid-studio-page .slide.cs .rc-clip{display:none; position:absolute; left:0; right:0; bottom:16px; z-index:3; overflow:hidden; line-height:1.3; text-align:center; color:#fff; font-size:13px; font-weight:500; letter-spacing:-.01em; pointer-events:none;}
.pixelgrid-studio-page .slide.cs .rc-i{display:inline-block; transform:translateY(130%); transition:transform .5s steps(5);}
.pixelgrid-studio-page .slide.cs:hover .rc-i{transform:translateY(0);}
@media(hover:hover) and (pointer:fine){
  .pixelgrid-studio-page .slide.cs .reveal-cta, .pixelgrid-studio-page .slide.cs .rc-clip{display:block;}
  .pixelgrid-studio-page .track-wrap .slide.cs, .pixelgrid-studio-page .track-wrap .slide.cs *{cursor:pointer;}
}
.pixelgrid-studio-page .ed .pts{list-style:none; margin:calc(var(--cell)*2) 0 0; padding:0;}
.pixelgrid-studio-page .ed .pts li{display:grid; grid-template-columns:auto 1fr; gap:var(--cell); align-items:baseline; padding:var(--cell) 0; border-top:1px solid var(--line); font-size:15px; line-height:1.5; color:#2a2a2a;}
.pixelgrid-studio-page .ed .pts li .n{color:var(--muted); white-space:nowrap;}
.pixelgrid-studio-page .ed .pts li b{font-weight:500; color:var(--ink);}
.pixelgrid-studio-page .ed .pts li:last-child{border-bottom:1px solid var(--line);}
.pixelgrid-studio-page #ai p.s{margin-top:calc(var(--cell)*2);}

/* ===== cta + footer ===== */
.pixelgrid-studio-page .cta{position:relative; z-index:2; background:transparent; padding:calc(var(--cell)*12) var(--gutter);}
.pixelgrid-studio-page .cta .wrap{max-width:var(--maxw); margin:0 auto; text-align:center;}
.pixelgrid-studio-page .cta h2{font-size:clamp(38px,8vw,130px); line-height:.95; letter-spacing:-.035em; font-weight:400; margin:0;}
.pixelgrid-studio-page .cta .meta{margin:30px auto 0; font-size:clamp(15px,1.2vw,19px); line-height:1.6; max-width:46ch; color:var(--muted); text-wrap:balance;}
.pixelgrid-studio-page .cta .meta.near{margin-top:16px;}
.pixelgrid-studio-page .cta .meta a{color:var(--ink); text-decoration:none; background:repeating-linear-gradient(90deg,var(--ink) 0 4px,transparent 4px 7px) left bottom/0% 3px no-repeat; transition:background-size .45s cubic-bezier(.16,1,.3,1); padding-bottom:2px;}
.pixelgrid-studio-page .cta .meta a:hover{background-size:100% 3px;}
.pixelgrid-studio-page .cta .meta .near{color:var(--ink);}
.pixelgrid-studio-page .btn, .pixelgrid-studio-page .cta .ctabtn, .pixelgrid-studio-page .tt-again, .pixelgrid-studio-page .tt-teaser{position:relative; display:inline-flex; align-items:center; justify-content:center; text-decoration:none; font-size:clamp(15px,1.2vw,18px); font-weight:500; letter-spacing:-.01em; padding:16px 36px; background:var(--ink); color:#fff; transition:background .2s;
  clip-path:polygon(10px 0, calc(100% - 10px) 0, calc(100% - 10px) 5px, calc(100% - 5px) 5px, calc(100% - 5px) 10px, 100% 10px, 100% calc(100% - 10px), calc(100% - 5px) calc(100% - 10px), calc(100% - 5px) calc(100% - 5px), calc(100% - 10px) calc(100% - 5px), calc(100% - 10px) 100%, 10px 100%, 10px calc(100% - 5px), 5px calc(100% - 5px), 5px calc(100% - 10px), 0 calc(100% - 10px), 0 10px, 5px 10px, 5px 5px, 10px 5px, 10px 0);}
.pixelgrid-studio-page .cta .ctabtn{margin-top:38px;}
.pixelgrid-studio-page .btn:hover, .pixelgrid-studio-page .cta .ctabtn:hover, .pixelgrid-studio-page .tt-again:hover, .pixelgrid-studio-page .tt-teaser:hover{background:#3b5bd9;}
.pixelgrid-studio-page .btn .lbl, .pixelgrid-studio-page .cta .ctabtn .lbl, .pixelgrid-studio-page .tt-again .lbl, .pixelgrid-studio-page .tt-teaser .lbl{position:relative; z-index:2;}
.pixelgrid-studio-page .btn .pxfx, .pixelgrid-studio-page .cta .ctabtn .pxfx, .pixelgrid-studio-page .tt-again .pxfx, .pixelgrid-studio-page .tt-teaser .pxfx{position:absolute; inset:0; z-index:1; display:grid; pointer-events:none;}
.pixelgrid-studio-page footer{position:relative; z-index:2; height:calc(var(--cell)*9); background:transparent; overflow:hidden; cursor:pointer; transition:height .55s cubic-bezier(.16,1,.3,1);}
.pixelgrid-studio-page footer.playing{height:min(52vh,390px); cursor:default;}
.pixelgrid-studio-page footer #footcity{position:absolute; left:0; bottom:0; width:100%; height:calc(var(--cell)*9); z-index:2; display:block; pointer-events:none;}
.pixelgrid-studio-page footer.playing #footcity{top:0; bottom:auto; height:min(52vh,390px);}
.pixelgrid-studio-page .tt-teaser{position:absolute; left:50%; top:50%; transform:translate(-50%,-50%); z-index:4; border:0; cursor:pointer; transition:opacity .35s, transform .35s, background .2s;}
.pixelgrid-studio-page footer.playing .tt-teaser{opacity:0; pointer-events:none; transform:translate(-50%,-50%) scale(.86);}
.pixelgrid-studio-page .tt-teaser .tt-blocks{display:inline-block; margin-left:9px; vertical-align:-3px;}
.pixelgrid-studio-page .tt-teaser .tt-blocks canvas{display:block;}
.pixelgrid-studio-page #tetris{position:absolute; inset:0; z-index:3; display:none; pointer-events:none; font-family:var(--mono);}
.pixelgrid-studio-page footer.playing #tetris{display:block;}
.pixelgrid-studio-page #tetris .tt-score{position:absolute; top:18px; left:22px; font-size:clamp(15px,2vw,22px); letter-spacing:.08em; color:var(--ink);}
.pixelgrid-studio-page #tetris .tt-hint{position:absolute; left:50%; bottom:22px; transform:translateX(-50%); text-align:center; font-size:11px; line-height:1.7; color:var(--muted); letter-spacing:.02em;}
.pixelgrid-studio-page #tetris .tt-pad{position:absolute; right:20px; bottom:20px; display:grid; grid-template-columns:repeat(2,44px); gap:8px; pointer-events:auto;}
.pixelgrid-studio-page #tetris .tt-pad button, .pixelgrid-studio-page #tetris .tt-close{border:0; background:#fff; color:var(--ink); cursor:pointer; display:grid; place-items:center; pointer-events:auto; box-shadow:0 2px 12px rgba(10,10,10,.14); transition:background .15s, color .15s;
  clip-path:polygon(8px 0, calc(100% - 8px) 0, calc(100% - 8px) 4px, calc(100% - 4px) 4px, calc(100% - 4px) 8px, 100% 8px, 100% calc(100% - 8px), calc(100% - 4px) calc(100% - 8px), calc(100% - 4px) calc(100% - 4px), calc(100% - 8px) calc(100% - 4px), calc(100% - 8px) 100%, 8px 100%, 8px calc(100% - 4px), 4px calc(100% - 4px), 4px calc(100% - 8px), 0 calc(100% - 8px), 0 8px, 4px 8px, 4px 4px, 8px 4px, 8px 0);}
.pixelgrid-studio-page #tetris .tt-pad button svg, .pixelgrid-studio-page #tetris .tt-close svg{width:18px; height:18px; display:block;}
.pixelgrid-studio-page #tetris .tt-pad button{width:44px; height:44px;}
.pixelgrid-studio-page #tetris .tt-pad button:hover, .pixelgrid-studio-page #tetris .tt-close:hover{background:var(--ink); color:#fff;}
.pixelgrid-studio-page #tetris .tt-close{position:absolute; top:18px; right:20px; width:38px; height:38px; z-index:6;}
.pixelgrid-studio-page #tetris .tt-over{position:absolute; inset:0; z-index:5; display:none; flex-direction:column; align-items:center; justify-content:center; gap:14px; text-align:center; pointer-events:auto; background:rgba(255,255,255,.86); -webkit-backdrop-filter:blur(3px); backdrop-filter:blur(3px); animation:pgsTtOver .3s ease both;}
.pixelgrid-studio-page #tetris.tt-isover .tt-over{display:flex;}
@keyframes pgsTtOver{from{opacity:0;} to{opacity:1;}}
.pixelgrid-studio-page #tetris .tt-over .ttl{font-size:clamp(22px,3.2vw,34px); font-weight:400; letter-spacing:-.02em; color:var(--ink); line-height:1;}
.pixelgrid-studio-page .tt-again{font-size:14px; padding:13px 30px;}
@media(max-width:680px){
  .pixelgrid-studio-page .tt-teaser{font-size:11px; letter-spacing:.18em; padding:11px 18px;}
  .pixelgrid-studio-page footer.playing{height:min(58vh,460px);}
  .pixelgrid-studio-page footer.playing #footcity{top:0; bottom:auto; height:calc(min(58vh,460px) - 88px);}
  .pixelgrid-studio-page #tetris .tt-close{top:10px; right:12px; width:36px; height:36px;}
  .pixelgrid-studio-page #tetris .tt-hint{display:none;}
  .pixelgrid-studio-page #tetris .tt-pad{left:50%; right:auto; bottom:22px; transform:translateX(-50%); grid-template-columns:repeat(4,52px); gap:8px;}
  .pixelgrid-studio-page #tetris .tt-pad button{width:52px; height:52px; font-size:20px;}
}
.pixelgrid-studio-page footer a{text-decoration:none; display:inline-flex; align-items:center; gap:5px;} .pixelgrid-studio-page footer a:hover{color:var(--ink);} .pixelgrid-studio-page footer .ar{width:13px; height:13px;}

.pixelgrid-studio-page .reveal{transform:translateY(18px); transition:transform .8s steps(6);}
.pixelgrid-studio-page .reveal.in{transform:none;}
@media (prefers-reduced-motion: reduce){ .pixelgrid-studio-page .reveal{transform:none;} }
@media(max-width:720px){
  .pixelgrid-studio-page .pxctl{display:none;}
  .pixelgrid-studio-page .ed p{text-align:left;}
  .pixelgrid-studio-page .hhead .hdesc span{text-align:left; -webkit-text-align-last:left; text-align-last:left;}
  .pixelgrid-studio-page .hhead .hfoot{flex-direction:column; gap:10px; align-items:flex-start;}
  .pixelgrid-studio-page .hhead .htag{text-align:left; max-width:none; width:100%;}
  .pixelgrid-studio-page .hero + .sheet{margin-top:clamp(calc(var(--cell)*5),16vh,calc(var(--cell)*13));}
  .pixelgrid-studio-page .ed{padding:calc(var(--cell)*5) var(--gutter);}
  .pixelgrid-studio-page .proc{padding:calc(var(--cell)*4) var(--gutter);}
  .pixelgrid-studio-page .caro{padding:calc(var(--cell)*4) var(--gutter);}
  .pixelgrid-studio-page .cta{padding:calc(var(--cell)*7) var(--gutter);}
}
.pixelgrid-studio-page .toplink{position:absolute; top:0; right:0; z-index:60; display:inline-flex; align-items:center; gap:8px; height:calc(var(--cell)*3); padding:0 18px; font-family:var(--mono); font-size:11px; letter-spacing:.13em; text-transform:uppercase; color:var(--ink); text-decoration:none; background:var(--paper); border:1px solid #fafafa; border-top:0; border-right:0; transform:translateY(-100%); pointer-events:none; transition:transform .4s cubic-bezier(.16,1,.3,1), border-color .2s ease;}
.pixelgrid-studio-page .toplink.show{transform:none; pointer-events:auto;}
.pixelgrid-studio-page .toplink:hover{border-color:var(--ink);}
.pixelgrid-studio-page .toplink .ar{width:14px; height:14px;}

/* ===== intro lead ===== */
.pixelgrid-studio-page .intro{position:relative; z-index:2; padding:calc(var(--cell)*7) var(--gutter) 0;}
.pixelgrid-studio-page .intro .wrap{max-width:var(--maxw); margin:0 auto;}
.pixelgrid-studio-page .intro .lead{font-size:clamp(26px,3.4vw,46px); line-height:1.06; letter-spacing:-.02em; font-weight:400; margin:0; max-width:none; opacity:0;}
.pixelgrid-studio-page .intro .lead.ready{opacity:1;}
.pixelgrid-studio-page .intro .lead em{font-style:normal; color:var(--muted);}
.pixelgrid-studio-page .intro .lead .ln{display:block; overflow:hidden; padding-bottom:.06em; margin-bottom:-.06em;}
.pixelgrid-studio-page .intro .lead .ln > span{display:block; transform:translateY(115%); transition:transform .85s steps(6);}
.pixelgrid-studio-page .intro .lead.in .ln > span{transform:translateY(0);}
@media(prefers-reduced-motion:reduce){ .pixelgrid-studio-page .intro .lead{opacity:1;} .pixelgrid-studio-page .intro .lead .ln > span{transform:none;} }
.pixelgrid-studio-page .intro .by{margin:18px 0 0; color:var(--muted);}

/* ===== process / protocol doughnuts (sharp, grid-snapped) ===== */
.pixelgrid-studio-page .proc{position:relative; z-index:2; padding:calc(var(--cell)*7) var(--gutter);}
.pixelgrid-studio-page .proc .wrap{max-width:var(--maxw); margin:0 auto;}
.pixelgrid-studio-page .proc .ph{display:flex; flex-direction:column; align-items:flex-start; gap:calc(var(--cell)*2); margin-bottom:calc(var(--cell)*3);}
.pixelgrid-studio-page .proc .phx{display:flex; flex-direction:column; align-items:flex-start; gap:calc(var(--cell)*2);}
.pixelgrid-studio-page .proc .ph h2{font-size:clamp(26px,3.4vw,46px); line-height:1.04; letter-spacing:-.02em; font-weight:400; margin:0;}
.pixelgrid-studio-page .proc .ph .pd{color:#2a2a2a; font-size:clamp(15px,1.15vw,18px); line-height:1.62; max-width:46ch; margin:0;}
.pixelgrid-studio-page .proc .procflow{width:100%; aspect-ratio:3/1; margin-bottom:clamp(14px,2.4vh,26px);}
.pixelgrid-studio-page .proc .procflow canvas{width:100%; height:100%; display:block;}
.pixelgrid-studio-page .proc .donuts{display:grid; grid-template-columns:repeat(2,1fr); gap:14px;}
@media(min-width:840px){ .pixelgrid-studio-page .proc .donuts{grid-template-columns:repeat(4,1fr);} }
.pixelgrid-studio-page .proc .step{display:flex; flex-direction:column; gap:13px;}
.pixelgrid-studio-page .proc .step{position:relative; transition:opacity .3s ease;}
@media(hover:hover){
  .pixelgrid-studio-page .proc .donuts:hover .step{opacity:.45;} .pixelgrid-studio-page .proc .donuts .step:hover{opacity:1;}
  .pixelgrid-studio-page .proc .donuts .step{cursor:none; padding-bottom:17px;}
  .pixelgrid-studio-page .proc .pxline{position:absolute; left:0; right:0; bottom:0; height:8px; opacity:0; transition:opacity .25s steps(3); pointer-events:none;}
  .pixelgrid-studio-page .proc .step:hover .pxline{opacity:1;}
  .pixelgrid-studio-page .proc .pxline::before{content:""; position:absolute; inset:0; background:repeating-linear-gradient(90deg,rgba(10,10,10,.12) 0 8px,transparent 8px 9px);}
  .pixelgrid-studio-page .proc .pxline i{position:absolute; top:0; left:0; width:62px; height:8px; background:repeating-linear-gradient(90deg,#0A0A0A 0 8px,transparent 8px 9px); transform:translateX(var(--lx,0px));}
}
.pixelgrid-studio-page .proc .donut{position:relative; aspect-ratio:1/1; overflow:hidden; background:#fff; transition:transform .4s cubic-bezier(.22,1,.36,1);}
.pixelgrid-studio-page #process .donut, .pixelgrid-studio-page #protocol-parts .donut{background:transparent;}
.pixelgrid-studio-page .proc .donut canvas{position:absolute; inset:0; width:100%; height:100%; display:block;}
.pixelgrid-studio-page .proc .dl{display:flex; align-items:center; gap:9px; line-height:1.25; margin-top:2px;}
.pixelgrid-studio-page .proc .dl .dn{display:inline-grid; place-items:center; width:22px; height:22px; flex:none; background:#1c2541; color:#fff; font-family:var(--mono); font-size:9px; letter-spacing:.04em;
  clip-path:polygon(6px 0, calc(100% - 6px) 0, calc(100% - 6px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px), calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 6px), 0 calc(100% - 6px), 0 6px, 3px 6px, 3px 3px, 6px 3px, 6px 0);}
.pixelgrid-studio-page .proc .dl .dt{font-size:15px; font-weight:500;}
.pixelgrid-studio-page .proc .dd{margin:0; font-size:13.5px; line-height:1.5; color:#2a2a2a;}

.pixelgrid-studio-page .btn{align-self:flex-start;}
.pixelgrid-studio-page .btn:hover{transform:translateY(-2px);}

/* lab tool tags */
.pixelgrid-studio-page .slide.cs .tags{display:flex; flex-wrap:wrap; justify-content:center; gap:7px; margin:14px 22px 0;}
.pixelgrid-studio-page .slide.cs .tags span{font-family:var(--mono); font-size:10px; font-weight:500; letter-spacing:.08em; text-transform:uppercase; line-height:1; padding:7px 13px; background:var(--c,#1c2541); color:var(--tc,#fff);
  clip-path:polygon(6px 0, calc(100% - 6px) 0, calc(100% - 6px) 3px, calc(100% - 3px) 3px, calc(100% - 3px) 6px, 100% 6px, 100% calc(100% - 6px), calc(100% - 3px) calc(100% - 6px), calc(100% - 3px) calc(100% - 3px), calc(100% - 6px) calc(100% - 3px), calc(100% - 6px) 100%, 6px 100%, 6px calc(100% - 3px), 3px calc(100% - 3px), 3px calc(100% - 6px), 0 calc(100% - 6px), 0 6px, 3px 6px, 3px 3px, 6px 3px, 6px 0);}
.pixelgrid-studio-page .slide.cs .tags .claude{--c:#e0492a; --tc:#fff;}
.pixelgrid-studio-page .slide.cs .tags .weave {--c:#3b5bd9; --tc:#fff;}
.pixelgrid-studio-page .slide.cs .tags .framer{--c:#0a0a0a; --tc:#fff;}
.pixelgrid-studio-page .slide.cs .tags .aframe{--c:#d8ff00; --tc:#0a0a0a;}
.pixelgrid-studio-page .slide.cs .tags .replit{--c:#f5c518; --tc:#0a0a0a;}
.pixelgrid-studio-page .slide.cs .tags .comfy {--c:#6c4cf1; --tc:#fff;}
`;
}
