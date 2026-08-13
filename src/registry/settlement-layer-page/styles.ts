/**
 * Settlement Layer Page - scoped styles.
 *
 * Every rule is scoped under .settlement-layer-page so the injected <style>
 * never leaks globals. Design tokens (colour ladder, breakpoints, type scale)
 * are measured values from the teardown documented in the registry entry.
 */

export function getSettlementLayerPageStyles() {
  return STYLES;
}

const STYLES = `
@import url("https://fonts.cdnfonts.com/css/pp-neue-montreal");
@import url("https://fonts.googleapis.com/css2?family=Fragment+Mono:wght@400&display=swap");

.settlement-layer-page{
  --slp-blue:#044ab3;
  --slp-blue-deep:#033a8c;
  --slp-blue-abyss:#051e43;
  --slp-accent:#0082f3;
  --slp-accent-2:#2895f7;
  --slp-pixel-accent:#6fe3ff;
  --slp-black:#151515;
  --slp-white:#ffffff;
  --slp-grey-1:#5d6c7b;
  --slp-grey-2:#758696;
  --slp-grey-3:#aaadb0;
  --slp-grey-4:#c8c8c8;
  --slp-grey-5:#e2e2e2;
  --slp-blue-a08:rgba(4,74,179,.08);
  --slp-blue-a10:rgba(4,74,179,.10);
  --slp-blue-a15:rgba(4,74,179,.15);
  --slp-blue-a25:rgba(4,74,179,.25);
  --slp-blue-a40:rgba(4,74,179,.40);
  --slp-hairline:rgba(255,255,255,.16);
  --slp-hairline-dark:rgba(21,21,21,.14);
  --slp-pad:clamp(1.25rem,4vw,4.5rem);
  --slp-display:"PP Neue Montreal","Neue Montreal",Inter,system-ui,sans-serif;
  --slp-mono:"Fragment Mono",ui-monospace,SFMono-Regular,Menlo,monospace;

  position:relative;
  isolation:isolate;
  width:100%;
  min-height:100svh;
  background:var(--slp-blue);
  color:var(--slp-white);
  font-family:var(--slp-display);
  -webkit-font-smoothing:antialiased;
  overflow-x:clip;
}
.settlement-layer-page *{margin:0;padding:0;box-sizing:border-box;-webkit-tap-highlight-color:transparent;}
.settlement-layer-page img{display:block;max-width:100%;}
.settlement-layer-page a{color:inherit;text-decoration:none;}
.settlement-layer-page button{font:inherit;color:inherit;background:none;border:0;cursor:pointer;}
.settlement-layer-page ul{list-style:none;}

/* ---------- type ---------- */
.settlement-layer-page .slp-eyebrow{
  font-family:var(--slp-mono);
  font-size:.72rem;
  letter-spacing:.14em;
  text-transform:uppercase;
  opacity:.72;
}
.settlement-layer-page .slp-h1{
  font-size:clamp(2.4rem,5.6vw,5.2rem);
  line-height:1.02;
  letter-spacing:-.03em;
  font-weight:400;
}
.settlement-layer-page .slp-h2{
  font-size:clamp(1.9rem,3.9vw,3.4rem);
  line-height:1.06;
  letter-spacing:-.025em;
  font-weight:400;
}
.settlement-layer-page .slp-h3{
  font-size:clamp(1.25rem,1.9vw,1.7rem);
  line-height:1.16;
  letter-spacing:-.015em;
  font-weight:400;
}
.settlement-layer-page .slp-body{
  font-size:clamp(.95rem,1.05vw,1.06rem);
  line-height:1.55;
  opacity:.82;
  max-width:56ch;
}
.settlement-layer-page .slp-small{font-size:.82rem;line-height:1.5;opacity:.7;}

/* ---------- layout ---------- */
.settlement-layer-page .slp-shell{position:relative;width:100%;}
.settlement-layer-page .slp-section{position:relative;padding:clamp(4rem,9vw,9rem) var(--slp-pad);}
.settlement-layer-page .slp-inner{width:100%;max-width:1440px;margin:0 auto;}
.settlement-layer-page .slp-on-blue{background:var(--slp-blue);color:var(--slp-white);}
.settlement-layer-page .slp-on-black{background:var(--slp-black);color:var(--slp-white);}
.settlement-layer-page .slp-on-white{background:var(--slp-white);color:var(--slp-black);}
.settlement-layer-page .slp-on-white .slp-eyebrow{opacity:.6;}

/* ---------- header ---------- */
.settlement-layer-page .slp-header{
  position:fixed;top:0;left:0;width:100%;z-index:60;
  display:flex;align-items:center;justify-content:space-between;
  gap:1rem;
  padding:1.05rem var(--slp-pad);
  color:var(--slp-white);
  transition:color .32s ease,background-color .32s ease,border-color .32s ease;
  border-bottom:1px solid transparent;
}
.settlement-layer-page .slp-header[data-light="true"]{
  color:var(--slp-black);
  background:rgba(255,255,255,.86);
  backdrop-filter:blur(14px);
  border-bottom-color:var(--slp-hairline-dark);
}
.settlement-layer-page .slp-header[data-scrolled="true"]:not([data-light="true"]){
  background:rgba(4,74,179,.72);
  backdrop-filter:blur(14px);
  border-bottom-color:var(--slp-hairline);
}
.settlement-layer-page .slp-logo{
  display:flex;align-items:center;gap:.55rem;
  font-family:var(--slp-mono);
  font-size:.86rem;letter-spacing:.2em;text-transform:uppercase;
}
.settlement-layer-page .slp-logo-mark{
  width:19px;height:19px;flex:none;
  border:1.5px solid currentColor;
  border-radius:50%;
  position:relative;
}
.settlement-layer-page .slp-logo-mark::after{
  content:"";position:absolute;inset:4px;
  background:currentColor;border-radius:50%;
}
/* Nav is two pill groups, not loose links. Measured: group 40px tall,
   rgba(0,0,0,.28), radius 3.6px; the active item is a 33px white pill at
   radius 2.18px. */
.settlement-layer-page .slp-pill-group{
  display:flex;align-items:center;gap:2px;
  height:40px;padding:3.5px;
  background:rgba(0,0,0,.28);
  border-radius:3.6px;
}
.settlement-layer-page .slp-nav{display:flex;align-items:center;}
.settlement-layer-page .slp-nav-link{
  position:relative;
  display:inline-flex;align-items:center;
  height:33px;padding:0 12px;
  font-size:13.68px;letter-spacing:-.005em;
  color:var(--slp-white);
  border-radius:2.18px;
  transition:background-color .24s ease,color .24s ease;
}
.settlement-layer-page .slp-nav-link:hover{background:rgba(255,255,255,.12);}
.settlement-layer-page .slp-nav-link[data-active="true"]{
  background:var(--slp-white);color:var(--slp-blue);
}
.settlement-layer-page .slp-header-actions{display:flex;align-items:center;gap:.5rem;}
/* The header CTA is the compact 33px variant of the button. */
.settlement-layer-page .slp-header-actions .slp-btn{
  min-height:40px;padding:3.5px 3.5px 3.5px 12px;font-size:13.68px;
}
.settlement-layer-page .slp-header-actions .slp-btn-inner{gap:14px;}
.settlement-layer-page .slp-header-actions .slp-btn-box{width:33px;height:33px;border-radius:2.214px;}
.settlement-layer-page .slp-header[data-light="true"] .slp-pill-group{background:rgba(21,21,21,.1);}
.settlement-layer-page .slp-header[data-light="true"] .slp-nav-link{color:var(--slp-black);}
.settlement-layer-page .slp-header[data-light="true"] .slp-nav-link[data-active="true"]{
  background:var(--slp-blue);color:var(--slp-white);
}
.settlement-layer-page .slp-burger{display:none;width:34px;height:34px;align-items:center;justify-content:center;}
.settlement-layer-page .slp-burger span{display:block;width:17px;height:1.5px;background:currentColor;position:relative;transition:transform .3s ease;}
.settlement-layer-page .slp-burger span::before,
.settlement-layer-page .slp-burger span::after{
  content:"";position:absolute;left:0;width:17px;height:1.5px;background:currentColor;transition:transform .3s ease;
}
.settlement-layer-page .slp-burger span::before{top:-5px;}
.settlement-layer-page .slp-burger span::after{top:5px;}
.settlement-layer-page .slp-burger[data-open="true"] span{background:transparent;}
.settlement-layer-page .slp-burger[data-open="true"] span::before{transform:translateY(5px) rotate(45deg);}
.settlement-layer-page .slp-burger[data-open="true"] span::after{transform:translateY(-5px) rotate(-45deg);}

.settlement-layer-page .slp-mobile-menu{
  position:fixed;inset:0;z-index:55;
  background:var(--slp-blue);
  padding:5.5rem var(--slp-pad) 2rem;
  display:flex;flex-direction:column;gap:.25rem;
  transform:translateY(-100%);
  transition:transform .5s cubic-bezier(.76,0,.24,1);
}
.settlement-layer-page .slp-mobile-menu[data-open="true"]{transform:translateY(0);}
.settlement-layer-page .slp-mobile-menu a{
  font-size:1.9rem;letter-spacing:-.02em;
  padding:.5rem 0;border-bottom:1px solid var(--slp-hairline);
}

/* ---------- buttons ----------
   Measured: shell 45px tall, radius 2.565px, padding 3.42px with a 13.68px
   lead on the left only, because the arrow box fills the right end. The label
   and the box are pushed apart by a fixed 61.56px gap rather than centred. */
.settlement-layer-page .slp-btn{
  position:relative;display:inline-flex;align-items:center;
  min-height:45px;
  padding:3.42px 3.42px 3.42px 13.68px;
  font-size:13.68px;letter-spacing:-.005em;
  border-radius:2.565px;
  background:var(--slp-white);color:var(--slp-blue);
  border:1px solid var(--slp-white);
  transition:background-color .3s ease,color .3s ease,border-color .3s ease;
}
.settlement-layer-page .slp-btn-inner{
  display:flex;align-items:center;gap:61.56px;
  width:100%;
}
.settlement-layer-page .slp-btn-box{
  width:38px;height:38px;flex:none;
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--slp-blue);
  border-radius:2.565px;
  color:var(--slp-white);
  transition:background-color .3s ease,color .3s ease;
}
.settlement-layer-page .slp-btn:hover{background:transparent;color:var(--slp-white);}
.settlement-layer-page .slp-btn:hover .slp-btn-box{background:var(--slp-white);color:var(--slp-blue);}

/* Ghost sits on the same geometry with an outlined shell. */
.settlement-layer-page .slp-btn-ghost{
  background:transparent;color:var(--slp-white);
  border-color:rgba(255,255,255,.55);
}
.settlement-layer-page .slp-btn-ghost .slp-btn-box{background:rgba(255,255,255,.14);color:var(--slp-white);}
.settlement-layer-page .slp-btn-ghost:hover{background:var(--slp-white);color:var(--slp-blue);border-color:var(--slp-white);}
.settlement-layer-page .slp-btn-ghost:hover .slp-btn-box{background:var(--slp-blue);color:var(--slp-white);}

.settlement-layer-page .slp-on-white .slp-btn{
  background:var(--slp-blue);color:var(--slp-white);border-color:var(--slp-blue);
}
.settlement-layer-page .slp-on-white .slp-btn .slp-btn-box{background:var(--slp-white);color:var(--slp-blue);}
.settlement-layer-page .slp-on-white .slp-btn:hover{background:transparent;color:var(--slp-blue);}
.settlement-layer-page .slp-on-white .slp-btn:hover .slp-btn-box{background:var(--slp-blue);color:var(--slp-white);}
.settlement-layer-page .slp-on-white .slp-btn-ghost{
  background:transparent;color:var(--slp-blue);border-color:var(--slp-blue-a40);
}
.settlement-layer-page .slp-on-white .slp-btn-ghost .slp-btn-box{background:var(--slp-blue-a15);color:var(--slp-blue);}

/* Line-reveal hover. Measured: 1.25em line box, 950ms on
   cubic-bezier(.16,1,.3,1), duplicate text from attr(data-text) parked at
   top:100% and pulled up by exactly one line. Desktop fine pointers only,
   because a sticky hover on touch leaves the label frozen mid-slide. */
.settlement-layer-page .slp-reveal{position:relative;display:inline-block;vertical-align:top;}
.settlement-layer-page .slp-reveal-inner{display:inline-block;will-change:transform;}
@media (min-width:992px) and (hover:hover) and (pointer:fine){
  .settlement-layer-page .slp-reveal{
    display:block;position:relative;overflow:hidden;
    height:1.25em;line-height:1.25em;
  }
  .settlement-layer-page .slp-reveal-inner{
    position:relative;display:block;
    transform:translateY(0%);
    transition:transform 950ms cubic-bezier(.16,1,.3,1);
  }
  .settlement-layer-page .slp-reveal-inner::after{
    content:attr(data-text);
    position:absolute;left:0;top:100%;
    white-space:nowrap;
  }
  .settlement-layer-page a:hover .slp-reveal-inner,
  .settlement-layer-page a:focus-visible .slp-reveal-inner,
  .settlement-layer-page button:hover .slp-reveal-inner,
  .settlement-layer-page button:focus-visible .slp-reveal-inner{
    transform:translateY(-100%);
  }
}

/* ---------- hero ---------- */
/* Measured: hero padding 136px 28px 36px, headline 56.16px/56.16px at
   -0.144px tracking, weight 400, sitting bottom-left. Caption is 11.8px
   Fragment Mono, uppercase, bottom-right. */
.settlement-layer-page .slp-hero{
  position:relative;
  min-height:100svh;
  display:flex;flex-direction:column;justify-content:flex-end;
  padding:136px 28px 36px;
  overflow:hidden;
}
.settlement-layer-page .slp-hero-field{
  position:absolute;inset:0;
  width:100%;height:100%;
  display:block;
  pointer-events:none;
}
.settlement-layer-page .slp-hero-headline{
  font-size:clamp(2rem,3.9vw,56.16px);
  line-height:1;
  letter-spacing:-.0026em;
  font-weight:400;
  margin-bottom:1.35rem;
}
.settlement-layer-page .slp-hero-caption{
  position:absolute;right:28px;bottom:36px;
  font-family:var(--slp-mono);
  font-size:11.808px;letter-spacing:-.02em;
  text-transform:uppercase;
  opacity:.72;
}
.settlement-layer-page .slp-hero-burst{
  position:absolute;
  top:clamp(-9rem,-11vw,-4rem);left:57%;
  width:min(34vw,440px);aspect-ratio:1;
  transform:translateX(-50%);
  pointer-events:none;
  opacity:.85;
}
.settlement-layer-page .slp-hero-burst line{
  stroke:rgba(255,255,255,.42);
  stroke-width:.28;
  vector-effect:non-scaling-stroke;
  transform-box:fill-box;
  transform-origin:center;
}
.settlement-layer-page .slp-hero-burst circle{fill:none;stroke:rgba(255,255,255,.16);stroke-width:.28;vector-effect:non-scaling-stroke;}
.settlement-layer-page .slp-hero-content{position:relative;z-index:2;max-width:1440px;margin:0 auto;width:100%;}
.settlement-layer-page .slp-hero-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:2rem;}
.settlement-layer-page .slp-hero-meta{
  display:flex;justify-content:space-between;align-items:flex-end;gap:2rem;
  margin-top:clamp(3rem,7vw,6rem);
  padding-top:1.1rem;
  border-top:1px solid var(--slp-hairline);
}

/* ---------- pixel dissolve ---------- */
.settlement-layer-page .slp-pixel-transition{
  position:relative;width:100%;line-height:0;overflow:hidden;
  background:var(--slp-px-from,var(--slp-blue));
}
.settlement-layer-page .slp-pixel-transition[data-solid="true"]{background:var(--slp-px-solid,var(--slp-white));}
.settlement-layer-page .slp-pixel-transition[data-solid="true"] .slp-pixel-grid{visibility:hidden;}
.settlement-layer-page .slp-pixel-grid{display:grid;}
.settlement-layer-page .slp-pixel{width:100%;height:100%;}

/* ---------- staircase connectors ---------- */
.settlement-layer-page .slp-path-svg{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;overflow:visible;}
.settlement-layer-page .slp-path-base{fill:none;stroke:rgba(255,255,255,.22);stroke-width:1;}
.settlement-layer-page .slp-on-white .slp-path-base{stroke:var(--slp-blue-a25);}
.settlement-layer-page .slp-path-pulse{fill:none;stroke:var(--slp-pixel-accent);stroke-width:1.6;opacity:0;}
.settlement-layer-page .slp-on-white .slp-path-pulse{stroke:var(--slp-accent);}

/* ---------- staircase flow ---------- */
.settlement-layer-page .slp-flow{
  position:absolute;inset:0;
  pointer-events:none;
  overflow:hidden;
}
.settlement-layer-page .slp-flow-svg{
  position:absolute;left:0;bottom:0;
  width:100%;height:100%;
  overflow:visible;
}
.settlement-layer-page .slp-flow-base{fill:none;stroke-width:1;}
.settlement-layer-page .slp-flow-pulse{
  fill:none;
  stroke:var(--slp-white);
  stroke-width:1.5;
}

/* ---------- built for ---------- */
.settlement-layer-page .slp-builtfor-grid{
  display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:start;
  margin-top:clamp(2.5rem,5vw,4rem);
}
.settlement-layer-page .slp-panel{
  position:relative;
  padding:clamp(1.5rem,2.4vw,2.25rem);
  background:var(--slp-blue-deep);
  border:1px solid var(--slp-hairline);
  display:flex;flex-direction:column;gap:1rem;
}
.settlement-layer-page .slp-panel-steps{position:relative;min-height:190px;}

/* ---------- trusted band ---------- */
.settlement-layer-page .slp-trusted{text-align:center;}
.settlement-layer-page .slp-trusted .slp-body{margin:1.1rem auto 0;text-align:center;}
.settlement-layer-page .slp-logo-band{
  display:grid;grid-template-columns:repeat(4,1fr);gap:1px;
  margin-top:clamp(2.5rem,5vw,4rem);
  background:var(--slp-hairline);
  border:1px solid var(--slp-hairline);
}
.settlement-layer-page .slp-logo-cell{
  display:flex;align-items:center;justify-content:center;
  min-height:92px;padding:1rem;
  background:var(--slp-blue);
  font-family:var(--slp-mono);font-size:.78rem;letter-spacing:.16em;
  text-transform:uppercase;opacity:.62;
}

/* ---------- product suite ---------- */
.settlement-layer-page .slp-products-head{
  display:flex;justify-content:space-between;align-items:flex-end;gap:2rem;flex-wrap:wrap;
}
.settlement-layer-page .slp-products-viewport{
  margin-top:clamp(2.5rem,5vw,4rem);
  overflow:hidden;cursor:grab;
}
.settlement-layer-page .slp-products-viewport[data-dragging="true"]{cursor:grabbing;}
.settlement-layer-page .slp-products-track{display:flex;gap:1.25rem;will-change:transform;}
.settlement-layer-page .slp-product-card{
  flex:none;width:clamp(240px,25vw,340px);
  aspect-ratio:1/1.12;
  padding:1.35rem;
  background:var(--slp-blue);
  display:flex;flex-direction:column;justify-content:space-between;
  transition:background-color .34s ease,transform .34s ease;
}
.settlement-layer-page .slp-product-card:hover{background:var(--slp-blue-deep);}
.settlement-layer-page .slp-product-card-top{display:flex;justify-content:space-between;align-items:flex-start;gap:1rem;}
.settlement-layer-page .slp-product-card h3{font-size:1.18rem;letter-spacing:-.015em;margin-bottom:.5rem;}
.settlement-layer-page .slp-product-card p{font-size:.86rem;line-height:1.48;opacity:.78;}

/* ---------- partners ---------- */
.settlement-layer-page .slp-globe{
  position:absolute;inset:0;
  width:100%;height:100%;
  display:block;pointer-events:none;
}
.settlement-layer-page .slp-partners-hero{
  position:relative;overflow:hidden;
  min-height:100svh;
  padding:clamp(8rem,14vw,11rem) var(--slp-pad) clamp(4rem,9vw,8rem);
  display:flex;flex-direction:column;
}
.settlement-layer-page .slp-partners-hero-inner{
  position:relative;z-index:2;
  flex:1;display:flex;flex-direction:column;justify-content:space-between;
}
.settlement-layer-page .slp-partners-lede{
  max-width:26rem;
  margin-left:auto;margin-right:auto;
  font-size:.92rem;line-height:1.55;opacity:.9;
}

/* ---------- company ---------- */
.settlement-layer-page .slp-cascade{
  position:absolute;inset:0;width:100%;height:100%;
  pointer-events:none;
}
.settlement-layer-page .slp-cascade-path{
  fill:none;
  stroke:rgba(255,255,255,.22);
  stroke-width:1.4;
  vector-effect:non-scaling-stroke;
}
.settlement-layer-page .slp-company-hero{
  position:relative;overflow:hidden;
  min-height:100svh;
  display:flex;align-items:center;
  padding:clamp(8rem,14vw,12rem) var(--slp-pad) clamp(4rem,8vw,7rem);
}
.settlement-layer-page .slp-company-grid{
  position:relative;z-index:2;
  display:grid;grid-template-columns:1fr 1fr;
  gap:clamp(2rem,6vw,6rem);align-items:center;
}
.settlement-layer-page .slp-company-mark{
  font-size:clamp(2.6rem,5vw,4.4rem);
  line-height:1;letter-spacing:-.03em;font-weight:400;
}
.settlement-layer-page .slp-company-statement{
  font-size:clamp(1.25rem,2vw,1.75rem);
  line-height:1.32;letter-spacing:-.02em;
  max-width:26ch;
}
.settlement-layer-page .slp-company-built{position:relative;}
.settlement-layer-page .slp-company-column{
  max-width:34rem;
  margin-left:auto;margin-right:auto;
}
.settlement-layer-page .slp-company-copy{
  display:flex;flex-direction:column;gap:1.1rem;margin-top:1.5rem;
}
.settlement-layer-page .slp-company-copy p{
  font-size:.92rem;line-height:1.55;opacity:.86;max-width:44ch;
}

/* ---------- product stack ---------- */
/* Pinned horizontal scroller: the section supplies the scroll length, the
   inner pin holds position, and the track slides sideways. */
.settlement-layer-page .slp-scroller{position:relative;}
.settlement-layer-page .slp-scroller-pin{
  position:sticky;top:0;
  height:100svh;
  display:flex;flex-direction:column;
  justify-content:center;
  gap:clamp(2rem,5vw,4rem);
  padding:clamp(6rem,10vw,8rem) 0 clamp(3rem,6vw,5rem);
  overflow:hidden;
}
.settlement-layer-page .slp-scroller-viewport{overflow:hidden;width:100%;}
.settlement-layer-page .slp-scroller-track{
  display:flex;
  gap:0;
  will-change:transform;
  padding-left:var(--slp-pad);
}
.settlement-layer-page .slp-stack-card{
  flex:none;
  width:400px;
  margin-right:53.57px;
  margin-top:var(--slp-card-drop,0px);
  display:flex;flex-direction:column;
  text-align:left;
  transform:rotate(var(--slp-card-rot,0deg));
  transition:transform .5s cubic-bezier(.22,1,.36,1);
}
.settlement-layer-page .slp-stack-card:hover{transform:rotate(0deg) translateY(-6px);}
.settlement-layer-page .slp-stack-media{
  position:relative;display:block;
  aspect-ratio:1;
  background:var(--slp-blue);
  overflow:hidden;
}
.settlement-layer-page .slp-plate{position:absolute;inset:0;width:100%;height:100%;}
.settlement-layer-page .slp-plate-trace{fill:none;stroke:rgba(255,255,255,.42);stroke-width:.7;}
.settlement-layer-page .slp-plate-pad{fill:rgba(255,255,255,.5);}
.settlement-layer-page .slp-plate-core{fill:none;stroke:rgba(255,255,255,.8);stroke-width:1;}
.settlement-layer-page .slp-stack-tag{
  position:absolute;top:12px;left:12px;
  padding:.28rem .5rem;
  background:rgba(255,255,255,.16);
  font-family:var(--slp-mono);font-size:.62rem;letter-spacing:.14em;
  text-transform:uppercase;border-radius:2px;
}
.settlement-layer-page .slp-stack-arrow{
  position:absolute;top:12px;right:12px;
  width:33px;height:33px;
  display:inline-flex;align-items:center;justify-content:center;
  background:var(--slp-white);color:var(--slp-blue);border-radius:2.214px;
}
.settlement-layer-page .slp-stack-body{
  display:block;padding:1.15rem;
  background:var(--slp-blue);
}
.settlement-layer-page .slp-stack-title{display:block;font-size:1.24rem;letter-spacing:-.018em;margin-bottom:.55rem;}
.settlement-layer-page .slp-stack-desc{display:block;font-size:.86rem;line-height:1.5;opacity:.82;}

/* ---------- capabilities ---------- */
.settlement-layer-page .slp-capabilities{position:relative;margin-top:clamp(3rem,6vw,5rem);}
.settlement-layer-page .slp-capability{
  position:relative;
  padding:clamp(1.5rem,3vw,2.5rem) 0;
  border-top:1px solid var(--slp-hairline);
  display:grid;grid-template-columns:1fr 1.4fr;gap:clamp(1rem,4vw,4rem);
  align-items:start;
}
.settlement-layer-page .slp-capability:last-child{border-bottom:1px solid var(--slp-hairline);}
.settlement-layer-page .slp-capability-index{font-family:var(--slp-mono);font-size:.74rem;opacity:.55;}

/* ---------- newsroom ---------- */
.settlement-layer-page .slp-news-grid{
  display:grid;grid-template-columns:repeat(3,1fr);gap:1.25rem;
  margin-top:clamp(2.5rem,5vw,4rem);
}
.settlement-layer-page .slp-news-card{
  display:flex;flex-direction:column;gap:.85rem;
  padding:1.35rem;
  background:var(--slp-grey-5);
  min-height:210px;
  transition:background-color .3s ease,transform .3s ease;
}
.settlement-layer-page .slp-news-card:hover{background:var(--slp-blue-a10);transform:translateY(-3px);}
.settlement-layer-page .slp-news-meta{display:flex;gap:.7rem;font-family:var(--slp-mono);font-size:.7rem;letter-spacing:.1em;text-transform:uppercase;opacity:.6;}
.settlement-layer-page .slp-news-card h3{font-size:1.02rem;line-height:1.3;letter-spacing:-.012em;margin-top:auto;}

/* ---------- cta ---------- */
.settlement-layer-page .slp-cta{position:relative;overflow:hidden;}
.settlement-layer-page .slp-cta-inner{
  position:relative;z-index:2;
  display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,4rem);align-items:center;
}
.settlement-layer-page .slp-cta h2{color:var(--slp-blue);}
.settlement-layer-page .slp-cta-actions{display:flex;flex-wrap:wrap;gap:.7rem;margin-top:1.5rem;}

/* ---------- footer ---------- */
.settlement-layer-page .slp-footer{background:var(--slp-black);color:var(--slp-white);padding:clamp(3rem,6vw,5rem) var(--slp-pad) 1.5rem;}
.settlement-layer-page .slp-footer-top{
  display:grid;grid-template-columns:1.4fr repeat(3,1fr);gap:clamp(1.5rem,4vw,3rem);
  padding-bottom:clamp(2.5rem,5vw,4rem);
  border-bottom:1px solid var(--slp-hairline);
}
.settlement-layer-page .slp-footer-col h4{
  font-family:var(--slp-mono);font-size:.72rem;letter-spacing:.14em;
  text-transform:uppercase;opacity:.55;margin-bottom:1rem;font-weight:400;
}
.settlement-layer-page .slp-footer-col li{margin-bottom:.55rem;}
.settlement-layer-page .slp-footer-col a{font-size:.9rem;opacity:.82;transition:opacity .2s ease;}
.settlement-layer-page .slp-footer-col a:hover{opacity:1;}
.settlement-layer-page .slp-subscribe{display:flex;gap:.5rem;margin-top:1.1rem;max-width:360px;}
.settlement-layer-page .slp-subscribe input{
  flex:1;padding:.7rem .9rem;font-size:.86rem;
  background:transparent;border:1px solid var(--slp-hairline);color:inherit;border-radius:2px;
}
.settlement-layer-page .slp-subscribe input::placeholder{color:rgba(255,255,255,.42);}
.settlement-layer-page .slp-subscribe input:focus{outline:none;border-color:rgba(255,255,255,.5);}
.settlement-layer-page .slp-footer-bottom{
  display:flex;justify-content:space-between;align-items:center;gap:1rem;flex-wrap:wrap;
  padding-top:1.5rem;font-size:.78rem;opacity:.55;
}
.settlement-layer-page .slp-wordmark{
  font-family:var(--slp-mono);
  font-size:clamp(2.2rem,9vw,7rem);
  letter-spacing:.06em;line-height:1;
  opacity:.1;margin-top:2rem;user-select:none;
}

/* ---------- inner page shells ---------- */
.settlement-layer-page .slp-page-hero{
  padding:clamp(8rem,14vw,12rem) var(--slp-pad) clamp(3rem,6vw,5rem);
}
.settlement-layer-page .slp-split{display:grid;grid-template-columns:1fr 1fr;gap:clamp(2rem,5vw,5rem);align-items:start;}
.settlement-layer-page .slp-card-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:1.25rem;margin-top:clamp(2.5rem,5vw,4rem);}
.settlement-layer-page .slp-card{
  padding:clamp(1.5rem,2.4vw,2.25rem);
  border:1px solid var(--slp-hairline);
  display:flex;flex-direction:column;gap:.75rem;min-height:200px;
}
.settlement-layer-page .slp-on-white .slp-card{border-color:var(--slp-hairline-dark);}
.settlement-layer-page .slp-stat-row{display:grid;grid-template-columns:repeat(4,1fr);gap:1.25rem;margin-top:clamp(2.5rem,5vw,4rem);}
.settlement-layer-page .slp-stat-value{font-size:clamp(1.9rem,3.4vw,3rem);letter-spacing:-.03em;line-height:1;}
.settlement-layer-page .slp-stat-label{font-family:var(--slp-mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6;margin-top:.6rem;}

/* partners pattern grid */
.settlement-layer-page .slp-partner-grid{display:grid;gap:1px;background:var(--slp-hairline);border:1px solid var(--slp-hairline);margin-top:clamp(2.5rem,5vw,4rem);}
@media (min-width:768px){
  .settlement-layer-page .slp-partner-grid{grid-template-columns:repeat(6,1fr);grid-template-rows:repeat(3,minmax(110px,auto));}
}
.settlement-layer-page .slp-partner-cell{
  display:flex;align-items:center;justify-content:center;
  min-height:110px;padding:1rem;background:var(--slp-blue);
  font-family:var(--slp-mono);font-size:.74rem;letter-spacing:.14em;text-transform:uppercase;opacity:.6;
}
.settlement-layer-page .slp-quote{
  margin-top:clamp(3rem,6vw,5rem);
  font-size:clamp(1.3rem,2.4vw,2rem);
  line-height:1.34;letter-spacing:-.02em;max-width:34ch;
}
.settlement-layer-page .slp-quote-attr{font-family:var(--slp-mono);font-size:.76rem;letter-spacing:.1em;text-transform:uppercase;opacity:.6;margin-top:1.2rem;}

/* ---------- testimonials ---------- */
.settlement-layer-page .slp-testimonials{margin-top:clamp(3rem,6vw,5rem);}
.settlement-layer-page .slp-testimonials .slp-quote{margin-top:0;min-height:9rem;}
.settlement-layer-page .slp-testimonial-controls{
  display:flex;align-items:center;justify-content:space-between;gap:1.5rem;
  margin-top:2rem;padding-top:1.1rem;
  border-top:1px solid var(--slp-hairline);
}
.settlement-layer-page .slp-on-white .slp-testimonial-controls{border-top-color:var(--slp-hairline-dark);}
.settlement-layer-page .slp-testimonial-dots{display:flex;align-items:center;gap:.5rem;}
.settlement-layer-page .slp-dot{
  width:7px;height:7px;border-radius:50%;
  background:currentColor;opacity:.3;
  transition:opacity .3s ease,transform .3s ease;
}
.settlement-layer-page .slp-dot[data-active="true"]{opacity:1;transform:scale(1.25);}
.settlement-layer-page .slp-testimonial-arrows{display:flex;gap:.5rem;}
.settlement-layer-page .slp-arrow-btn{
  width:38px;height:38px;
  display:inline-flex;align-items:center;justify-content:center;
  border:1px solid currentColor;border-radius:2.565px;
  opacity:.55;
  transition:opacity .25s ease,background-color .25s ease,color .25s ease;
}
.settlement-layer-page .slp-arrow-btn:hover{opacity:1;background:var(--slp-white);color:var(--slp-blue);}
.settlement-layer-page .slp-on-white .slp-arrow-btn:hover{background:var(--slp-blue);color:var(--slp-white);}

/* roles */
.settlement-layer-page .slp-role{
  display:grid;grid-template-columns:2.2fr 1fr 1fr auto;gap:1rem;align-items:center;
  padding:1.25rem 0;border-top:1px solid var(--slp-hairline);
  transition:padding-left .3s ease;
}
.settlement-layer-page .slp-role:last-child{border-bottom:1px solid var(--slp-hairline);}
.settlement-layer-page .slp-role:hover{padding-left:.6rem;}
.settlement-layer-page .slp-role-title{font-size:1.08rem;letter-spacing:-.015em;}
.settlement-layer-page .slp-role-meta{font-family:var(--slp-mono);font-size:.76rem;letter-spacing:.08em;opacity:.65;}

/* form */
.settlement-layer-page .slp-form{display:flex;flex-direction:column;gap:1rem;max-width:520px;}
.settlement-layer-page .slp-field{display:flex;flex-direction:column;gap:.45rem;}
.settlement-layer-page .slp-field label{font-family:var(--slp-mono);font-size:.72rem;letter-spacing:.12em;text-transform:uppercase;opacity:.6;}
.settlement-layer-page .slp-field input,
.settlement-layer-page .slp-field textarea{
  padding:.8rem .95rem;font:inherit;font-size:.92rem;
  background:transparent;border:1px solid var(--slp-hairline);color:inherit;border-radius:2px;
}
.settlement-layer-page .slp-field textarea{min-height:130px;resize:vertical;}
.settlement-layer-page .slp-field input:focus,
.settlement-layer-page .slp-field textarea:focus{outline:none;border-color:rgba(255,255,255,.55);}
.settlement-layer-page .slp-form-note{font-size:.8rem;opacity:.6;}

/* article */
.settlement-layer-page .slp-progress{position:fixed;top:0;left:0;height:2px;background:var(--slp-accent);z-index:70;width:0;}
.settlement-layer-page .slp-prose{max-width:68ch;display:flex;flex-direction:column;gap:1.3rem;}
.settlement-layer-page .slp-prose p{font-size:clamp(1rem,1.15vw,1.12rem);line-height:1.68;opacity:.86;}
.settlement-layer-page .slp-article-meta{display:flex;gap:1.2rem;flex-wrap:wrap;align-items:center;font-family:var(--slp-mono);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;opacity:.6;}
.settlement-layer-page .slp-copy-link{
  font-family:var(--slp-mono);font-size:.74rem;letter-spacing:.1em;text-transform:uppercase;
  padding:.32rem .6rem;border:1px solid currentColor;border-radius:2.565px;
  transition:background-color .25s ease,color .25s ease;
}
.settlement-layer-page .slp-copy-link:hover{background:var(--slp-white);color:var(--slp-blue);}
.settlement-layer-page .slp-article-list{display:flex;flex-direction:column;margin-top:clamp(2.5rem,5vw,4rem);}
.settlement-layer-page .slp-article-row{
  display:grid;grid-template-columns:auto 1fr auto;gap:clamp(1rem,3vw,3rem);align-items:center;
  padding:clamp(1.4rem,2.6vw,2.2rem) 0;border-top:1px solid var(--slp-hairline-dark);
  transition:padding-left .32s ease;
}
.settlement-layer-page .slp-article-row:last-child{border-bottom:1px solid var(--slp-hairline-dark);}
.settlement-layer-page .slp-article-row:hover{padding-left:.7rem;}

/* scroll-driven reveal primitives */
.settlement-layer-page .slp-fade{opacity:0;transform:translateY(22px);}
.settlement-layer-page .slp-fade[data-in="true"]{opacity:1;transform:none;transition:opacity .8s cubic-bezier(.22,1,.36,1),transform .8s cubic-bezier(.22,1,.36,1);}

/* ---------- breakpoints (Webflow ladder: 991 / 767 / 479) ---------- */
@media screen and (max-width:991px){
  .settlement-layer-page .slp-nav{display:none;}
  .settlement-layer-page .slp-burger{display:flex;}
  .settlement-layer-page .slp-header-actions .slp-btn{display:none;}
  .settlement-layer-page .slp-builtfor-grid,
  .settlement-layer-page .slp-split,
  .settlement-layer-page .slp-cta-inner{grid-template-columns:1fr;}
  .settlement-layer-page .slp-news-grid{grid-template-columns:repeat(2,1fr);}
  .settlement-layer-page .slp-footer-top{grid-template-columns:1fr 1fr;}
  .settlement-layer-page .slp-capability{grid-template-columns:1fr;gap:.7rem;}
  .settlement-layer-page .slp-hero-burst{width:82vw;left:62%;transform:translateX(-50%);opacity:.55;}
}
@media screen and (max-width:767px){
  .settlement-layer-page .slp-logo-band{grid-template-columns:repeat(2,1fr);}
  .settlement-layer-page .slp-card-grid{grid-template-columns:1fr;}
  .settlement-layer-page .slp-stat-row{grid-template-columns:repeat(2,1fr);}
  .settlement-layer-page .slp-news-grid{grid-template-columns:1fr;}
  .settlement-layer-page .slp-role{grid-template-columns:1fr auto;gap:.5rem 1rem;}
  .settlement-layer-page .slp-role-meta[data-hide-sm="true"]{display:none;}
  .settlement-layer-page .slp-article-row{grid-template-columns:1fr;gap:.6rem;}
  .settlement-layer-page .slp-hero-meta{flex-direction:column;align-items:flex-start;gap:1rem;}
}
@media screen and (max-width:479px){
  .settlement-layer-page .slp-footer-top{grid-template-columns:1fr;}
  .settlement-layer-page .slp-product-card{width:78vw;}
  .settlement-layer-page .slp-subscribe{flex-direction:column;}
}

@media (prefers-reduced-motion:reduce){
  .settlement-layer-page .slp-fade{opacity:1;transform:none;}
  .settlement-layer-page *{animation-duration:.01ms !important;transition-duration:.01ms !important;}
}
`;
