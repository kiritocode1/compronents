/**
 * Scoped styles for the BLNK Agency page port of obys.agency.
 * Layout, logo brackets, meta rails, work case study, and chrome mirror
 * the source CSS under `.blnk-agency-page`. Instrument Sans replaces Obys Sans.
 *
 * BLANK - aryank.space
 */

export function getBlnkAgencyPageStyles(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400;0,500;0,600;1,400&display=swap");

.blnk-agency-page {
  /* Fluid design unit standing in for the source's responsive root rem:
     every dimension in this sheet multiplies it, so the whole composition
     scales with the viewport (0.75vw ~ the source's density at any width). */
  --bap-rem: clamp(9px, 0.69vw, 17.6px);
  --bap-g: calc(1 * var(--bap-rem));
  --bap-mx: calc(1 * var(--bap-rem));
  --bap-my: calc(1 * var(--bap-rem));
  --bap-c: calc((100% - (var(--bap-mx) * 2 + var(--bap-g) * 11)) / 12);
  --bap-white: #fff;
  --bap-black: #000;
  --bap-muted: #c9c9c9;
  --bap-ease: cubic-bezier(0.16, 1, 0.3, 1);
  --bap-ease-out: cubic-bezier(0.19, 1, 0.22, 1);

  position: relative;
  width: 100%;
  height: 100%;
  min-height: 100svh;
  overflow: hidden;
  background: var(--bap-white);
  color: var(--bap-black);
  font-family: "Instrument Sans", system-ui, sans-serif;
  font-size: calc(1.1 * var(--bap-rem));
  line-height: 1.2;
  letter-spacing: -0.01em;
  -webkit-font-smoothing: antialiased;
  overscroll-behavior: none;
}

.blnk-agency-page *,
.blnk-agency-page *::before,
.blnk-agency-page *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

.blnk-agency-page button {
  display: block;
  color: inherit;
  outline: 0;
  background: none;
  border: 0;
  font: inherit;
  cursor: pointer;
}

.blnk-agency-page a {
  color: inherit;
  text-decoration: none;
}

.blnk-agency-page img {
  display: block;
  width: 100%;
  height: auto;
}

/* line-mask (source .ln / .ln_) */
.blnk-agency-page .bap-ln_ {
  overflow: hidden;
  display: block;
}
.blnk-agency-page .bap-ln {
  display: block;
  transform: translateY(110%);
  will-change: transform;
}
.blnk-agency-page .bap-ln.is-in {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}

.blnk-agency-page .bap-u {
  overflow: hidden;
  width: 100%;
  height: 3px;
}
.blnk-agency-page .bap-u > div {
  border-bottom: 1.34px solid currentColor;
  width: 100%;
  height: 1px;
  transform: translateX(-100.1%);
}
.blnk-agency-page .bap-u.is-on > div {
  transform: translateX(0);
  transition: transform 0.8s var(--bap-ease);
}

/* ---- Shell ---- */
.blnk-agency-page .bap-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}
.blnk-agency-page .bap-page {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

/* ---- Preloader (source #preloader / #prg / #preloader-prg) ---- */
.blnk-agency-page .bap-preloader {
  position: absolute;
  inset: 0;
  z-index: 9998;
  overflow: hidden;
  pointer-events: all;
}
.blnk-agency-page .bap-preloader-bg {
  position: absolute;
  inset: 0;
  background: #000;
  will-change: opacity, background-color;
}
/* source #prg — thin top bar */
.blnk-agency-page .bap-prg {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 10002;
  width: 100%;
  height: 2.5px;
  overflow: hidden;
}
.blnk-agency-page .bap-prg > div {
  width: 100%;
  height: 100%;
  background: #fff;
  transform: translateX(-101%);
  will-change: transform;
}
/* source #preloader-prg — numeric counter only, no spinner */
.blnk-agency-page .bap-preloader-pct {
  position: absolute;
  right: var(--bap-mx);
  top: 50%;
  z-index: 10002;
  color: #fff;
  mix-blend-mode: difference;
  transform: translateY(-50%);
  font-variant-numeric: tabular-nums;
  overflow: hidden;
  font-size: calc(1.1 * var(--bap-rem));
}
.blnk-agency-page .bap-preloader-pct > span {
  display: block;
}

/* ---- Logo brackets (source #logo) ---- */
.blnk-agency-page .bap-logo {
  position: absolute;
  top: calc(50% + var(--bap-logo-y, 0px));
  left: 50%;
  z-index: 10001;
  pointer-events: none;
  will-change: transform;
  mix-blend-mode: difference;
  color: #fff;
  transform: translate(-50%, calc(-50% + var(--bap-logo-y1, 0px)));
  transition: color 0.4s ease-out;
}
.blnk-agency-page .bap-logo > svg {
  position: relative;
  z-index: 1;
  aspect-ratio: 1;
  overflow: visible;
  width: calc(13 * var(--bap-rem));
  max-width: 28vmin;
  height: auto;
  transition: width 1.6s cubic-bezier(0.19, 1, 0.22, 1);
  display: block;
}
.blnk-agency-page .bap-logo.is-intro > svg {
  transition: none;
}
.blnk-agency-page .bap-logo.is-on > svg {
  width: var(--bap-logo-w, calc(13 * var(--bap-rem)));
  max-width: 28vmin;
}
.blnk-agency-page .bap-logo #bap-logo-l,
.blnk-agency-page .bap-logo #bap-logo-r {
  transition: transform 1s cubic-bezier(0.16, 1, 0.3, 1);
}
/* source exact */
.blnk-agency-page .bap-logo.is-spread #bap-logo-l {
  transform: translate(-137%);
}
.blnk-agency-page .bap-logo.is-spread #bap-logo-r {
  transform: translate(137%);
}
.blnk-agency-page .bap-logo.is-hide {
  opacity: 0;
}
/* After boot, logo sits above gallery but under chrome */
.blnk-agency-page[data-ready="1"] .bap-logo {
  z-index: 40;
}

/* Intro planes (source eh WebGL planes, DOM stand-in) */
.blnk-agency-page .bap-intro-stack {
  position: absolute;
  inset: 0;
  z-index: 10000;
  pointer-events: none;
  overflow: hidden;
}
.blnk-agency-page .bap-intro-plane {
  position: absolute;
  left: 50%;
  top: 50%;
  overflow: hidden;
  will-change: width, height, top, left, opacity;
}
.blnk-agency-page .bap-intro-plane img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
}

/* ---- Header (source #header) ---- */
.blnk-agency-page .bap-header {
  position: absolute;
  top: var(--bap-my);
  left: var(--bap-mx);
  right: var(--bap-mx);
  display: flex;
  color: #000;
  pointer-events: none;
  z-index: 50;
  justify-content: space-between;
  align-items: flex-start;
}
.blnk-agency-page .bap-header-title {
  pointer-events: all;
  overflow: hidden;
  max-width: calc(var(--bap-c) * 2 + var(--bap-g) * 2);
  font-size: clamp(calc(1.6 * var(--bap-rem)), 3.2vw, calc(2.4 * var(--bap-rem)));
  font-weight: 500;
  letter-spacing: -0.05em;
  line-height: 0.9;
  text-align: left;
  transition: max-width 0.8s var(--bap-ease), font-size 0.8s var(--bap-ease);
}
.blnk-agency-page .bap-header-title.is-shrink {
  max-width: calc(4.05 * var(--bap-rem));
  font-size: calc(1.15 * var(--bap-rem));
}
.blnk-agency-page .bap-header-title > span {
  display: inline-block;
  transform: translateY(120%);
}
.blnk-agency-page .bap-header-title.is-in > span {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}
.blnk-agency-page .bap-header-right {
  display: flex;
  align-items: flex-start;
  gap: var(--bap-g);
}
.blnk-agency-page .bap-header-menu {
  display: flex;
  pointer-events: all;
  overflow: hidden;
}
.blnk-agency-page .bap-header-menu > button:not(:last-child)::after {
  content: ",\\00a0";
}
.blnk-agency-page .bap-header-menu > button {
  position: relative;
  height: 1.2lh;
  line-height: 1;
  display: inline-block;
  transform: translateY(110%);
}
.blnk-agency-page .bap-header-menu > button.is-in {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}
.blnk-agency-page .bap-header-menu > button > span {
  position: relative;
  overflow: hidden;
}
.blnk-agency-page .bap-header-menu > button > span::before {
  content: "";
  position: absolute;
  transform-origin: right;
  border-bottom: calc(0.1 * var(--bap-rem)) solid;
  width: 100%;
  height: 1px;
  transition: transform 0.8s var(--bap-ease-out);
  bottom: 0;
  left: 0;
  transform: scaleX(0);
}
.blnk-agency-page .bap-header-menu > button.is-on > span::before,
.blnk-agency-page .bap-header-menu > button:hover > span::before {
  transform-origin: left;
  transform: scaleX(1);
}
.blnk-agency-page .bap-header-time {
  overflow: hidden;
  font-variant-numeric: tabular-nums;
}
.blnk-agency-page .bap-header-time > span {
  display: inline-block;
  transform: translateY(110%);
}
.blnk-agency-page .bap-header-time > span.is-in {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}
.blnk-agency-page .bap-header-contact-wrap {
  text-align: right;
  overflow: hidden;
}
.blnk-agency-page .bap-header-contact {
  text-align: right;
  pointer-events: all;
  display: inline-block;
  transform: translateY(110%);
}
.blnk-agency-page .bap-header-contact.is-in {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}

/* ---- Studio caption #fx (top-right under header, as live site) ---- */
.blnk-agency-page .bap-fx {
  position: absolute;
  top: calc(var(--bap-my) + calc(2.6 * var(--bap-rem)));
  right: var(--bap-mx);
  z-index: 50;
  width: calc(var(--bap-c) * 3 + var(--bap-g) * 2);
  max-width: 28ch;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.6s ease;
  color: #000;
}
.blnk-agency-page .bap-fx.is-on {
  opacity: 1;
}
.blnk-agency-page .bap-fx.is-hide {
  opacity: 0;
  pointer-events: none;
}
.blnk-agency-page .bap-fx-de {
  font-size: 0.95em;
  margin-bottom: calc(0.75 * var(--bap-rem));
}
.blnk-agency-page .bap-fx-co {
  display: flex;
  flex-direction: column;
  gap: calc(0.1 * var(--bap-rem));
  pointer-events: all;
  width: fit-content;
}
.blnk-agency-page .bap-fx-co a {
  position: relative;
}

/* ---- Work stage ---- */
.blnk-agency-page .bap-work {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  touch-action: none;
}
.blnk-agency-page .bap-mode {
  position: absolute;
  inset: 0;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.blnk-agency-page .bap-mode.is-active {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}

/* Mode switcher */
.blnk-agency-page .bap-modes {
  position: absolute;
  left: var(--bap-g);
  bottom: var(--bap-g);
  overflow: hidden;
  z-index: 5;
}
.blnk-agency-page .bap-modes > button {
  position: relative;
  display: inline-block;
  transform: translateY(110%);
  margin-right: 0.15em;
}
.blnk-agency-page .bap-modes > button.is-in {
  transform: translateY(0);
  transition: transform 1s var(--bap-ease);
}
.blnk-agency-page .bap-modes > button::before {
  content: "";
  position: absolute;
  transform-origin: right;
  border-bottom: 1.34px solid;
  width: 100%;
  height: 1px;
  transition: transform 0.8s var(--bap-ease);
  bottom: 0;
  left: 0;
  transform: scaleX(0);
}
.blnk-agency-page .bap-modes > button.is-on::before {
  transform-origin: left;
  transform: scaleX(1);
}
.blnk-agency-page .bap-copy {
  position: absolute;
  bottom: var(--bap-g);
  right: var(--bap-g);
  color: var(--bap-muted);
  z-index: 5;
}

/* ---- Vertical gallery (source #ho-wo-0) ---- */
.blnk-agency-page .bap-v-wrap {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
}
.blnk-agency-page .bap-v-track {
  display: flex;
  flex-direction: column;
  align-items: center;
  /* source: gap calc(.5 * var(--bap-rem)) between frames — real vertical space between projects */
  gap: calc(0.5 * var(--bap-rem));
  will-change: transform;
  padding: 50vh 0;
  pointer-events: auto;
}

/* Hit frame (source .r) — images sit as media; WebGL is approximated in DOM */
.blnk-agency-page .bap-frame {
  display: block;
  position: relative;
  background: #ececec;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
  border: 0;
  padding: 0;
  opacity: 0.7;
  transition: opacity 0.4s ease;
}
.blnk-agency-page .bap-frame.is-on {
  opacity: 1;
}
.blnk-agency-page .bap-frame img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.12);
  will-change: transform;
  transition: transform 0.9s var(--bap-ease);
}
.blnk-agency-page .bap-frame.is-on img {
  transform: scale(1);
}
/* border-width plane cue (source bw): inactive reads a light rim */
.blnk-agency-page .bap-frame::after {
  content: "";
  position: absolute;
  inset: 0;
  border: calc(0.1 * var(--bap-rem)) solid rgba(0, 0, 0, 0.12);
  opacity: 1;
  transition: opacity 0.4s ease;
  pointer-events: none;
}
.blnk-agency-page .bap-frame.is-on::after {
  opacity: 0;
}

/* Titles #ho-wo-0-ti */
.blnk-agency-page .bap-v-titles {
  position: absolute;
  top: 50%;
  left: var(--bap-g);
  width: calc(var(--bap-c) * 2 + var(--bap-g) * 1);
  overflow: hidden;
  height: min(calc(25.25 * var(--bap-rem)), 62vh);
  line-height: 1.2;
  transform: translateY(-50%);
  pointer-events: none;
  z-index: 3;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 12%,
    #000 88%,
    transparent
  );
}
.blnk-agency-page .bap-v-titles-track {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  will-change: transform;
}
.blnk-agency-page .bap-title {
  display: block;
  text-align: left;
  white-space: nowrap;
  width: 100%;
  opacity: 0.21;
  transition: opacity 0.3s ease;
  line-height: 1.2;
  background: none;
  border: 0;
  font: inherit;
  color: inherit;
  padding: 0;
  cursor: default;
  pointer-events: none;
}
.blnk-agency-page .bap-title.is-on {
  opacity: 1;
}

/* Meta #ho-wo-0-me_ — three columns across the stage mid-line */
.blnk-agency-page .bap-v-meta {
  position: absolute;
  top: 50%;
  left: calc(var(--bap-c) * 2 + var(--bap-g) * 3);
  width: calc(var(--bap-c) * 10 + var(--bap-g) * 9);
  overflow: hidden;
  pointer-events: none;
  height: 1lh;
  line-height: 1.2;
  transform: translateY(-50%);
  z-index: 3;
}
.blnk-agency-page .bap-v-meta-inner {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  opacity: 0;
  transform: translateY(110%);
}
.blnk-agency-page .bap-v-meta-inner.is-on {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.35s ease, transform 0.7s var(--bap-ease);
}
.blnk-agency-page .bap-v-meta-inner > span {
  white-space: nowrap;
}
.blnk-agency-page .bap-v-meta-inner > span:first-child {
  /* 7 of the container's 10 columns. --bap-c cannot be reused here: its 100%
     would re-resolve against this narrower container instead of the page. */
  width: 71%;
  flex-shrink: 0;
}
.blnk-agency-page .bap-v-meta-inner > span:nth-child(2) {
  flex-shrink: 0;
}
.blnk-agency-page .bap-v-meta-inner > span:nth-child(3) {
  text-align: right;
  margin-left: auto;
  font-variant-numeric: tabular-nums;
}

/* ---- Horizontal gallery (source #ho-wo-1) ---- */
.blnk-agency-page .bap-h-wrap {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.blnk-agency-page .bap-h-track {
  position: absolute;
  display: flex;
  align-items: center;
  gap: calc(0.5 * var(--bap-rem));
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  will-change: transform;
  padding: 0 50vw;
  pointer-events: auto;
}
.blnk-agency-page .bap-h-track .bap-frame {
  transform: rotate(-90deg);
  flex-shrink: 0;
}
.blnk-agency-page .bap-h-titles {
  position: absolute;
  bottom: 0;
  right: var(--bap-g);
  width: calc(var(--bap-c) * 3 + var(--bap-g) * 2);
  clip-path: inset(0 0 2.5% 0);
  overflow: hidden;
  height: min(calc(24.5 * var(--bap-rem)), 58vh);
  pointer-events: none;
  z-index: 3;
  mask-image: linear-gradient(
    to bottom,
    transparent,
    #000 14%,
    #000 90%,
    transparent
  );
}
.blnk-agency-page .bap-h-titles-track {
  display: flex;
  flex-direction: column;
  width: 100%;
  will-change: transform;
}
.blnk-agency-page .bap-h-meta {
  position: absolute;
  bottom: var(--bap-g);
  right: var(--bap-g);
  width: calc(var(--bap-c) * 6 + var(--bap-g) * 5);
  pointer-events: none;
  height: min(calc(24.5 * var(--bap-rem)), 58vh);
  z-index: 3;
}
.blnk-agency-page .bap-h-meta-line {
  position: absolute;
  overflow: hidden;
  width: 100%;
  height: 1.1lh;
  top: calc(50% + calc(1.425 * var(--bap-rem)));
  left: 0;
  transform: translateY(-50%);
}
.blnk-agency-page .bap-h-meta-inner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  white-space: nowrap;
  gap: calc(1 * var(--bap-rem));
  width: 100%;
  opacity: 0;
  transform: translateY(110%);
}
.blnk-agency-page .bap-h-meta-rule {
  flex: 1;
  height: 1px;
  border-top: 1px solid currentColor;
  opacity: 0.35;
}
.blnk-agency-page .bap-h-meta-inner.is-on {
  opacity: 1;
  transform: translateY(0);
  transition: opacity 0.35s ease, transform 0.7s var(--bap-ease);
}

/* ---- Grid (source #ho-wo-2) ---- */
.blnk-agency-page .bap-grid-viewport {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}
.blnk-agency-page .bap-grid-track {
  will-change: transform;
  pointer-events: auto;
}
.blnk-agency-page .bap-grid {
  position: relative;
  padding: calc(var(--bap-g) * 3) var(--bap-g);
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: calc(5 * var(--bap-rem)) var(--bap-g);
  min-height: 100svh;
}
.blnk-agency-page .bap-grid-empty {
  opacity: 0.22;
  color: var(--bap-muted);
  font-variant-numeric: tabular-nums;
  font-size: 0.9em;
  user-select: none;
}
.blnk-agency-page .bap-grid-item {
  position: relative;
  grid-row: var(--gr);
  grid-column: var(--gc);
}
.blnk-agency-page .bap-grid-img {
  position: relative;
  display: block;
  width: 100%;
  cursor: pointer;
  background: #ececec;
  overflow: hidden;
  border: 0;
  padding: 0;
}
.blnk-agency-page .bap-grid-img::before {
  content: "";
  position: absolute;
  opacity: 0;
  z-index: 1;
  border: calc(0.1 * var(--bap-rem)) solid rgba(0, 0, 0, 0.1);
  inset: calc(0.1 * var(--bap-rem));
  transition: opacity 0.35s ease;
  pointer-events: none;
}
.blnk-agency-page .bap-grid-img.is-hv::before,
.blnk-agency-page .bap-grid-img:hover::before {
  opacity: 1;
}
.blnk-agency-page .bap-grid-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transform: scale(1.04);
  transition: transform 1.2s var(--bap-ease);
}
.blnk-agency-page .bap-grid-img:hover img,
.blnk-agency-page .bap-grid-img.is-hv img {
  transform: scale(1);
}
/* Fixed expand preview on hover (source .ho-wo-2-r) */
.blnk-agency-page .bap-grid-preview {
  position: absolute;
  width: min(22%, calc(16 * var(--bap-rem)));
  overflow: hidden;
  pointer-events: none;
  z-index: 8;
  clip-path: inset(50%);
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  transition: clip-path 0.8s var(--bap-ease);
  margin: 0;
}
.blnk-agency-page .bap-grid-preview.is-on {
  clip-path: inset(0%);
  z-index: 9;
}
.blnk-agency-page .bap-grid-preview > img {
  display: block;
  width: 100%;
  height: auto;
  transition: transform 1.6s var(--bap-ease);
  transform: scale(1.15);
}
.blnk-agency-page .bap-grid-preview.is-on > img {
  transform: scale(1);
}
.blnk-agency-page .bap-grid-title {
  position: absolute;
  letter-spacing: -0.03em;
  white-space: nowrap;
  text-align: center;
  overflow: hidden;
  font-size: clamp(calc(3 * var(--bap-rem)), 8vw, calc(8 * var(--bap-rem)));
  line-height: 1;
  bottom: 8%;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  pointer-events: none;
  mix-blend-mode: difference;
  color: #fff;
}
.blnk-agency-page .bap-grid-title > div {
  transform: translateY(110%);
  transition: transform 0.8s var(--bap-ease);
}
.blnk-agency-page .bap-grid-title.is-on > div {
  transform: translateY(0);
}
.blnk-agency-page .bap-grid-meta {
  position: absolute;
  top: 50%;
  left: var(--bap-g);
  right: var(--bap-g);
  display: flex;
  gap: var(--bap-g);
  transform: translateY(-50%);
  z-index: 10;
  pointer-events: none;
  mix-blend-mode: difference;
  color: #fff;
}
.blnk-agency-page .bap-grid-meta > div {
  overflow: hidden;
}
.blnk-agency-page .bap-grid-meta > div:first-child {
  width: calc(var(--bap-c) * 2 + var(--bap-g));
}
.blnk-agency-page .bap-grid-meta > div:nth-child(2) {
  width: calc(var(--bap-c) * 2 + var(--bap-g));
}
.blnk-agency-page .bap-grid-meta > div:nth-child(3) {
  margin-left: calc(var(--bap-c) * 5 + var(--bap-g) * 5);
}
.blnk-agency-page .bap-grid-meta > div:nth-child(4) {
  margin-left: auto;
}
.blnk-agency-page .bap-grid-meta > div > div {
  transform: translateY(110%);
  transition: transform 0.8s var(--bap-ease);
}
.blnk-agency-page .bap-grid-meta.is-on > div > div {
  transform: translateY(0);
}

/* ---- Work case study (source #wo) ---- */
.blnk-agency-page .bap-case {
  position: absolute;
  inset: 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
  background: var(--bap-white);
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.blnk-agency-page .bap-case.is-active {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}
.blnk-agency-page .bap-case-back {
  position: absolute;
  bottom: var(--bap-g);
  left: var(--bap-g);
  color: var(--bap-muted);
  z-index: 2;
}
.blnk-agency-page .bap-case-back .bap-u {
  transform-origin: right;
  transition: transform 0.6s var(--bap-ease);
}
.blnk-agency-page .bap-case-back:hover .bap-u {
  transform: scaleX(0);
}
.blnk-agency-page .bap-case-info {
  display: flex;
  padding-left: var(--bap-g);
  z-index: 2;
  gap: 0;
}
.blnk-agency-page .bap-case-ti {
  width: calc(var(--bap-c) * 2 + var(--bap-g) * 1);
  font-size: clamp(calc(1.4 * var(--bap-rem)), 2.4vw, calc(2 * var(--bap-rem)));
  font-weight: 500;
  letter-spacing: -0.03em;
}
.blnk-agency-page .bap-case-meta {
  width: calc(var(--bap-c) * 3 + var(--bap-g) * 2);
  padding-inline: var(--bap-mx);
  box-sizing: border-box;
}
.blnk-agency-page .bap-case-meta h2 {
  font-size: 1em;
  font-weight: 400;
  margin-bottom: calc(0.15 * var(--bap-rem));
}
.blnk-agency-page .bap-case-link {
  display: inline-block;
  margin-top: calc(1.1 * var(--bap-rem));
  position: relative;
}
.blnk-agency-page .bap-case-ga {
  position: relative;
  width: calc(var(--bap-c) * 6 + var(--bap-g) * 6.5);
  overflow: hidden;
  height: 100%;
  touch-action: none;
}
.blnk-agency-page .bap-case-ga-track {
  will-change: transform;
  display: flex;
  flex-direction: column;
}
.blnk-agency-page .bap-case-ga-track img {
  width: 100%;
  height: auto;
  display: block;
  flex-shrink: 0;
}

/* ---- About ---- */
.blnk-agency-page .bap-about {
  position: absolute;
  inset: 0;
  overflow-x: hidden;
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: none;
  background: var(--bap-white);
  z-index: 4;
  opacity: 0;
  pointer-events: none;
  visibility: hidden;
}
.blnk-agency-page .bap-about::-webkit-scrollbar {
  display: none;
}
.blnk-agency-page .bap-about.is-active {
  opacity: 1;
  pointer-events: auto;
  visibility: visible;
}
.blnk-agency-page .bap-about-inner {
  padding: calc(5.5 * var(--bap-rem)) var(--bap-g) calc(4 * var(--bap-rem));
}
.blnk-agency-page .bap-about-lead {
  letter-spacing: -0.03em;
  font-size: clamp(calc(1.8 * var(--bap-rem)), 4vw, calc(4 * var(--bap-rem)));
  line-height: 1.18;
  max-width: 18ch;
  margin-bottom: calc(3 * var(--bap-rem));
}
.blnk-agency-page .bap-about-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: calc(2 * var(--bap-rem)) var(--bap-g);
  padding-bottom: calc(4 * var(--bap-rem));
}
.blnk-agency-page .bap-about-col {
  grid-column: span 3;
}
.blnk-agency-page .bap-about-col h2 {
  color: var(--bap-muted);
  font-size: 0.95em;
  font-weight: 400;
  margin-bottom: calc(0.75 * var(--bap-rem));
}
.blnk-agency-page .bap-about-col p,
.blnk-agency-page .bap-about-col a {
  display: block;
  margin-bottom: calc(0.35 * var(--bap-rem));
}
.blnk-agency-page .bap-about-visual {
  grid-column: 5 / span 6;
  aspect-ratio: 1;
  overflow: hidden;
  background: #ececec;
}
.blnk-agency-page .bap-about-visual img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.blnk-agency-page .bap-about-foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: calc(2 * var(--bap-rem));
  padding: calc(3 * var(--bap-rem)) 0 calc(2 * var(--bap-rem));
  border-top: 1px solid rgba(0, 0, 0, 0.08);
}
.blnk-agency-page .bap-about-mark {
  font-size: clamp(calc(4 * var(--bap-rem)), 14vw, calc(12 * var(--bap-rem)));
  line-height: 0.85;
  letter-spacing: -0.06em;
  font-weight: 500;
}
.blnk-agency-page .bap-about-note {
  color: var(--bap-muted);
  max-width: 28ch;
  text-align: right;
}

/* Page transition veil (source preloader-bg during route change) */
.blnk-agency-page .bap-route-veil {
  position: absolute;
  inset: 0;
  z-index: 9990;
  background: var(--bap-black);
  opacity: 0;
  pointer-events: none;
}

@media (max-width: 900px) {
  .blnk-agency-page .bap-grid {
    grid-template-columns: repeat(4, minmax(0, 1fr));
    gap: calc(2.5 * var(--bap-rem)) var(--bap-g);
  }
  .blnk-agency-page .bap-grid-item {
    grid-row: var(--gr-s);
    grid-column: var(--gc-s);
  }
  .blnk-agency-page .bap-header-time {
    display: none;
  }
  .blnk-agency-page .bap-fx {
    display: none;
  }
  .blnk-agency-page .bap-case {
    flex-direction: column;
    justify-content: flex-start;
    overflow-y: auto;
  }
  .blnk-agency-page .bap-case-ga {
    width: 100%;
    height: 50svh;
  }
  .blnk-agency-page .bap-case-info {
    flex-direction: column;
    padding: calc(5 * var(--bap-rem)) var(--bap-g) calc(2 * var(--bap-rem));
    gap: calc(1 * var(--bap-rem));
  }
  .blnk-agency-page .bap-case-ti,
  .blnk-agency-page .bap-case-meta {
    width: 100%;
  }
}
`;
}
