const DARK_CATALOG_PAGE_STYLES = `@import url('https://fonts.googleapis.com/css2?family=DM+Mono:wght@300;400;500&family=Host+Grotesk:wght@300;400;450;500;600;700;800&display=swap');
.dark-catalog-page{--font-host-grotesk:"Host Grotesk";--font-dm-mono:"DM Mono";position:relative;isolation:isolate;}
@font-face {
  font-family: "Verilet";
  src: url("__ASSET_BASE__/fonts/verilet.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "Cossette Titre";
  src: url("__ASSET_BASE__/fonts/cossette-titre.ttf") format("truetype");
  font-weight: 400;
  font-style: normal;
  font-display: swap;
}
@font-face {
  font-family: "SUSE Mono";
  src: url("__ASSET_BASE__/fonts/suse-mono-variable.ttf") format("truetype");
  font-weight: 100 900;
  font-style: normal;
  font-display: swap;
}
.dark-catalog-page {
  --type-1: "Verilet", sans-serif;
  --type-2: "Cossette Titre", sans-serif;
  --type-3: "SUSE Mono", monospace;

  --base-100: #f7f5f0;
  --base-200: #272a2a;
  --base-300: #0b0b0b;
}
.dark-catalog-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  -webkit-tap-highlight-color: transparent;
  user-select: none;
  text-transform: uppercase;
}
.dark-catalog-page ::-webkit-scrollbar {
  display: none;
}
.dark-catalog-page {
  font-family: var(--type-2);
  background-color: var(--base-300);
  color: var(--base-100);
}
.dark-catalog-page html.lenis,
.dark-catalog-page html.lenis body {
  height: auto;
}
.dark-catalog-page .lenis.lenis-smooth {
  scroll-behavior: auto !important;
}
.dark-catalog-page .lenis.lenis-smooth [data-lenis-prevent] {
  overscroll-behavior: contain;
}
.dark-catalog-page .lenis.lenis-stopped {
  overflow: hidden;
}
.dark-catalog-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dark-catalog-page .container {
  position: relative;
  width: 100%;
  max-width: 2000px;
  height: 100%;
  margin: 0 auto;
  padding: 0.75rem;
}
.dark-catalog-page .type-1 {
  font-family: var(--type-1);
}
.dark-catalog-page .type-2 {
  font-family: var(--type-2);
}
.dark-catalog-page .type-3 {
  font-family: var(--type-3);
}
.dark-catalog-page h1.type-1,
.dark-catalog-page h2.type-1,
.dark-catalog-page h3.type-1,
.dark-catalog-page h4.type-1,
.dark-catalog-page h5.type-1,
.dark-catalog-page h6.type-1 {
  font-weight: 500;
  letter-spacing: -5%;
  padding: 0 0.75rem;
  line-height: 0.6;
}
.dark-catalog-page h1.type-1 {
  font-size: clamp(6rem, 12vw, 18rem);
}
.dark-catalog-page h2.type-1 {
  font-size: clamp(5rem, 10vw, 15rem);
}
.dark-catalog-page h3.type-1 {
  font-size: clamp(4rem, 8vw, 12rem);
}
.dark-catalog-page h4.type-1 {
  font-size: clamp(3rem, 6vw, 9rem);
}
.dark-catalog-page h5.type-1 {
  font-size: clamp(2rem, 4vw, 6rem);
}
.dark-catalog-page h6.type-1 {
  font-size: clamp(1.5rem, 3vw, 4.5rem);
}
.dark-catalog-page h1.type-2,
.dark-catalog-page h2.type-2,
.dark-catalog-page h3.type-2,
.dark-catalog-page h4.type-2,
.dark-catalog-page h5.type-2,
.dark-catalog-page h6.type-2 {
  font-weight: 500;
  letter-spacing: -3%;
  padding: 0 0.5rem;
  line-height: 0.9;
}
.dark-catalog-page h1.type-2 {
  font-size: clamp(4rem, 8vw, 12rem);
}
.dark-catalog-page h2.type-2 {
  font-size: clamp(3rem, 6vw, 9rem);
}
.dark-catalog-page h3.type-2 {
  font-size: clamp(2.5rem, 5vw, 7.5rem);
}
.dark-catalog-page h4.type-2 {
  font-size: clamp(2rem, 4vw, 6rem);
}
.dark-catalog-page h5.type-2 {
  font-size: clamp(1.5rem, 3vw, 4.5rem);
}
.dark-catalog-page h6.type-2 {
  font-size: clamp(1.25rem, 2.5vw, 3.75rem);
}
.dark-catalog-page p,
.dark-catalog-page a {
  text-decoration: none;
  font-family: var(--type-2);
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 0.9;
}
.dark-catalog-page p.sm {
  font-size: 1.25rem;
}
.dark-catalog-page p.lg {
  font-size: 1.75rem;
}
.dark-catalog-page .mono {
  font-family: var(--type-3);
  font-size: 0.85rem;
  font-weight: 450;
  line-height: 1;
  letter-spacing: -2%;
}
.dark-catalog-page .mono.sm {
  font-size: 0.75rem;
}
.dark-catalog-page .mono.lg {
  font-size: 0.95rem;
}
.dark-catalog-page .btn {
  border: 1px solid var(--base-100);
  padding: 0.65rem 2.5rem;
  border-radius: 4rem;
}
.dark-catalog-page .transition-grid {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100svh;
  display: flex;
  flex-direction: column;
  z-index: 1000;
  pointer-events: none;
}
.dark-catalog-page .transition-grid.is-blocking,
.dark-catalog-page .transition-grid.is-blocking .transition-row,
.dark-catalog-page .transition-grid.is-blocking .transition-block {
  pointer-events: auto;
}
.dark-catalog-page .transition-row {
  flex: 1;
  display: flex;
}
.dark-catalog-page .transition-row.row-1 .transition-block {
  transform-origin: top;
}
.dark-catalog-page .transition-row.row-2 .transition-block {
  transform-origin: bottom;
}
.dark-catalog-page .transition-block {
  flex: 1;
  background-color: #49534e;
  will-change: transform;
}
@media (max-width: 1000px) {
.dark-catalog-page .btn {
    padding: 0.65rem 2rem;
  }
}
.dark-catalog-page .hero {
  position: relative;
  width: 100%;
  height: 100dvh;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: hidden;
}
.dark-catalog-page .hero .fluorescent,
.dark-catalog-page .hero-content,
.dark-catalog-page .hero-footer,
.dark-catalog-page .hero-logo {
  will-change: transform;
}
.dark-catalog-page .hero-logo {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 15rem;
}
.dark-catalog-page .hero-footer {
  position: absolute;
  left: 0;
  transform: none;
  bottom: 2.5rem;
  width: 100%;
  text-align: center;
}
.dark-catalog-page .hero-footer p {
  max-width: 20rem;
  margin: 0 auto;
}
.dark-catalog-page .hero-content {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 100%;
}
.dark-catalog-page .hero-content .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.25rem;
}
.dark-catalog-page .about {
  position: relative;
  width: 100%;
  min-height: 100svh;
  padding: 10rem 0;
  background-color: var(--base-200);
  color: var(--base-100);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
}
.dark-catalog-page .about p.mono {
  margin-bottom: 1rem;
}
.dark-catalog-page .about .about-copy {
  width: 100%;
}
.dark-catalog-page .about .about-copy .container {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
}
@media (max-width: 1000px) {
.dark-catalog-page .hero {
    height: 100dvh;
  }
.dark-catalog-page .hero-content {
    display: none;
  }
.dark-catalog-page .about .about-copy .container {
    width: 100%;
  }
}
.dark-catalog-page .catalog-slider {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  cursor: pointer;
}
.dark-catalog-page .catalog-canvas {
  display: block;
  width: 100%;
  height: 100%;
}
.dark-catalog-page .catalog-slider-content {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  z-index: 2;
  display: flex;
  justify-content: flex-end;
  padding: 0 0.75rem 0 2.25rem;
  box-sizing: border-box;
}
.dark-catalog-page .catalog-slider-content.is-awaiting-enter .container {
  visibility: hidden;
}
.dark-catalog-page .catalog-slider-content .container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
  width: 50%;
  max-width: none;
  margin: 0;
}
.dark-catalog-page .catalog-slide-title h1 {
  display: block;
  font-size: clamp(2.5rem, 5vw, 7.5rem);
}
.dark-catalog-page .catalog-line {
  overflow: hidden;
}
.dark-catalog-page .catalog-line span {
  position: relative;
  display: inline-block;
  will-change: transform;
}
.dark-catalog-page .catalog-slide-description {
  width: 55%;
  padding: 0.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  color: var(--base-100);
}
.dark-catalog-page .catalog-slide-info {
  display: flex;
  flex-direction: column;
  gap: 0.35rem;
}
.dark-catalog-page .catalog-slide-link a {
  position: relative;
  display: block;
  width: max-content;
  padding: 0.5rem 0;
  color: var(--base-100);
  cursor: pointer;
}
.dark-catalog-page .catalog-slider-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 1;
  color: var(--base-100);
  pointer-events: none;
}
.dark-catalog-page .catalog-slider-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.25rem;
}
@media (max-width: 1000px) {
.dark-catalog-page .catalog-slider-content {
    justify-content: center;
    padding: 0 1rem;
  }
.dark-catalog-page .catalog-slider-content .container {
    width: calc(100% - 2rem);
    align-items: center;
    text-align: center;
  }
.dark-catalog-page .catalog-slide-title h1 {
    padding: 0;
    justify-content: center;
  }
.dark-catalog-page .catalog-slide-description {
    width: 90%;
  }
.dark-catalog-page .catalog-slide-link a {
    margin: 0 auto;
  }
}
.dark-catalog-page .brief-hero {
  position: relative;
  width: 100%;
  height: 80svh;
  background-color: var(--base-300);
  display: flex;
  justify-content: center;
  align-items: center;
}
.dark-catalog-page .brief-banner-img {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.dark-catalog-page .brief-banner-img-wrapper {
  width: 100%;
  height: 100%;
}
.dark-catalog-page .brief-overview {
  position: relative;
  width: 100%;
  padding: 8rem 0;
  background-color: var(--base-200);
}
.dark-catalog-page .brief-overview-header {
  width: 100%;
  margin-bottom: 8rem;
}
.dark-catalog-page .brief-overview-header .container {
  display: flex;
  justify-content: space-between;
  padding: 2.25rem;
}
.dark-catalog-page .brief-overview-header .container h2 {
  width: 50%;
}
.dark-catalog-page .brief-overview-content {
  width: 100%;
}
.dark-catalog-page .brief-overview-content .container {
  display: flex;
  gap: 2rem;
  padding: 2.25rem;
}
.dark-catalog-page .brief-overview-content .brief-overview-content-col:nth-child(1) {
  flex: 2;
}
.dark-catalog-page .brief-overview-content .brief-overview-content-col:nth-child(2) {
  flex: 5;
}
.dark-catalog-page .brief-overview-content .brief-overview-content-col:nth-child(2) h5 {
  padding: 0;
  margin-bottom: 4rem;
}
.dark-catalog-page .brief-images {
  position: relative;
  width: 100%;
  background-color: var(--base-200);
}
.dark-catalog-page .brief-images-container {
  width: 100%;
}
.dark-catalog-page .brief-img {
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
  height: 100%;
  aspect-ratio: 8/5;
}
.dark-catalog-page .brief-images-container .container {
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.dark-catalog-page .next-brief {
  position: relative;
  width: 100%;
  padding: 10rem 2.25rem 14rem 2.25rem;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
  overflow: hidden;
  background-color: var(--base-200);
}
.dark-catalog-page .next-brief-header {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
@media (max-width: 1000px) {
.dark-catalog-page .brief-hero-header {
    width: 85%;
  }
.dark-catalog-page .brief-overview-header .container {
    flex-direction: column-reverse;
    gap: 2rem;
  }
.dark-catalog-page .brief-overview-header .container h2 {
    padding: 0;
    width: 100%;
  }
.dark-catalog-page .brief-overview-header {
    margin-bottom: 4rem;
  }
.dark-catalog-page .brief-overview-content .container {
    flex-direction: column;
  }
.dark-catalog-page .brief-images-container .container {
    width: 100%;
    gap: 0.75rem;
  }
}
.dark-catalog-page .studio-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: var(--base-200);
}
.dark-catalog-page .studio-hero-img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.dark-catalog-page .studio-hero-header {
  position: absolute;
  top: 25%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
}
.dark-catalog-page .studio-hero-header .container h1 {
  width: 100%;
  text-align: center;
  color: var(--base-100);
}
@media (max-width: 1000px) {
.dark-catalog-page .studio-hero-header h1 {
    font-size: 3rem;
  }
}
.dark-catalog-page .contact-page {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: var(--base-200);
}
.dark-catalog-page .contact-copy {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 1;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.dark-catalog-page .contact-copy .contact-copy-main {
  width: 75%;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  text-align: center;
  color: var(--tone-400);
}
.dark-catalog-page .contact-copy .contact-copy-main .contact-header {
  color: var(--tone-500);
}
.dark-catalog-page .contact-copy .contact-copy-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}
.dark-catalog-page .contact-copy .contact-copy-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  padding: 2.25rem;
  color: var(--tone-400);
}
.dark-catalog-page .contact-col-copy h4:last-child {
  pointer-events: none;
}
.dark-catalog-page .contact-col-copy h4:last-child * {
  pointer-events: none;
  color: inherit !important;
  text-decoration: none !important;
}
.dark-catalog-page a[href^="tel:"] {
  pointer-events: none !important;
  color: var(--tone-400) !important;
  text-decoration: none !important;
  font-size: inherit !important;
  font-weight: inherit !important;
  font-family: inherit !important;
  line-height: inherit !important;
}
.dark-catalog-page .contact-copy .contact-copy-footer .container p:nth-child(2) {
  text-align: right;
}
@media (max-width: 1000px) {
.dark-catalog-page .contact-copy .contact-copy-main {
    width: 90%;
  }
.dark-catalog-page .contact-copy h6.type-2 {
    font-size: 1.75rem;
  }
}
.dark-catalog-page nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  will-change: transform;
  transform: translateY(0px);
  z-index: 200;
}
.dark-catalog-page .nav-container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1.5rem;
  background-color: rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  border-radius: 6px;
  z-index: 200;
  transition:
    background-color 0.3s ease,
    backdrop-filter 0.3s ease;
}
.dark-catalog-page .nav-container > div {
  flex: 1;
}
.dark-catalog-page .nav-cta {
  display: flex;
  align-items: center;
}
.dark-catalog-page nav .nav-cta .btn,
.dark-catalog-page nav .nav-toggler .btn {
  display: inline-flex;
  align-items: center;
  width: max-content;
  min-height: calc(1rem + 0.65rem * 2 + 2px);
  cursor: pointer;
  text-decoration: none;
}
.dark-catalog-page nav .nav-toggler .btn {
  gap: 1rem;
}
.dark-catalog-page .nav-logo {
  position: relative;
  width: 3.5rem;
  object-fit: contain;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: translateY(0.1rem);
  transition: opacity 0.3s ease;
}
.dark-catalog-page .nav-logo img {
  width: 3rem;
}
.dark-catalog-page nav a {
  color: var(--base-100);
}
.dark-catalog-page nav .nav-toggler {
  display: flex;
  justify-content: flex-end;
  align-items: center;
}
.dark-catalog-page nav .nav-toggler-hamburger {
  position: relative;
  width: 1.5rem;
  height: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 0.25rem;
}
.dark-catalog-page nav .nav-toggler-hamburger span {
  position: relative;
  width: 100%;
  height: 1.5px;
  background-color: var(--base-100);
  will-change: transform;
}
.dark-catalog-page nav.top .nav-container {
  background-color: rgba(255, 255, 255, 0);
  backdrop-filter: blur(0px);
}
.dark-catalog-page nav.top .nav-container .nav-logo {
  opacity: 0;
}
.dark-catalog-page .nav-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100svh;
  background-color: var(--base-200);
  opacity: 0;
  visibility: hidden;
  pointer-events: none;
  z-index: 10;
  overflow: hidden;
  will-change: opacity;
  transform: translateZ(0);
}
.dark-catalog-page .nav-overlay .nav-items {
  position: absolute;
  top: 45%;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  transform: translate(0%, -50%);
}
.dark-catalog-page .nav-overlay .nav-overlay-logo {
  width: 7.5rem;
  margin-bottom: 5rem;
}
.dark-catalog-page .nav-overlay .nav-items .nav-item {
  position: relative;
  width: 100%;
  text-align: center;
}
.dark-catalog-page .nav-overlay .nav-items .nav-item a {
  color: var(--tone-400);
  font-size: clamp(1.5rem, 3vw, 4.5rem);
  font-weight: 500;
  letter-spacing: -4%;
  padding: 0 0.5rem;
  line-height: 0.9;
  user-select: none;
}
.dark-catalog-page .nav-overlay .nav-items .nav-item.active a {
  color: var(--tone-500);
}
.dark-catalog-page .nav-overlay .nav-footer {
  position: absolute;
  left: 0;
  bottom: 0;
  width: 100%;
}
.dark-catalog-page .nav-overlay .nav-footer .nav-footer-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1.5rem;
}
.dark-catalog-page .nav-overlay .nav-footer .nav-footer-item {
  display: flex;
  gap: 2rem;
}
.dark-catalog-page .nav-overlay .nav-footer .nav-footer-item a {
  color: var(--tone-400);
}
@media (max-width: 1000px) {
.dark-catalog-page .nav-overlay .nav-items {
    width: 100%;
    transform: translate(0%, -50%);
  }
.dark-catalog-page .nav-logo {
    display: none;
  }
.dark-catalog-page .nav-overlay .nav-items .nav-item a {
    font-size: clamp(2.5rem, 5vw, 7.5rem);
  }
.dark-catalog-page .nav-overlay .nav-footer .nav-footer-item {
    gap: 1rem;
  }
}
.dark-catalog-page .preloader {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  display: flex;
  align-items: center;
  padding: 2rem;
  background-color: var(--base-300);
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  will-change: clip-path;
  overflow: hidden;
  z-index: 9999;
}
.dark-catalog-page .preloader p {
  color: var(--base-100);
  font-family: var(--type-3);
  font-size: 0.85rem;
  font-weight: 450;
  line-height: 1;
  letter-spacing: -2%;
  text-transform: uppercase;
}
.dark-catalog-page .preloader-revealer {
  position: absolute;
  top: 50%;
  left: 50%;
  width: 100%;
  aspect-ratio: 1;
  background-color: #49534e;
  will-change: transform;
  z-index: 2;
  visibility: hidden;
}
.dark-catalog-page .preloader.is-copy-ready .preloader-revealer {
  visibility: visible;
}
.dark-catalog-page .preloader-copy,
.dark-catalog-page .preloader-copy-col,
.dark-catalog-page .preloader-counter {
  flex: 1;
  display: flex;
}
.dark-catalog-page .preloader-copy,
.dark-catalog-page .preloader-counter {
  visibility: hidden;
}
.dark-catalog-page .preloader.is-copy-ready .preloader-copy,
.dark-catalog-page .preloader.is-copy-ready .preloader-counter {
  visibility: visible;
}
.dark-catalog-page .preloader-counter {
  justify-content: flex-end;
}
.dark-catalog-page .preloader-copy p {
  width: 75%;
}
.dark-catalog-page .preloader .line {
  will-change: transform;
  transform: translateY(100%);
}
@media (max-width: 1000px) {
.dark-catalog-page .preloader,
.dark-catalog-page .preloader-copy {
    flex-direction: column;
  }
.dark-catalog-page .preloader-revealer {
    width: 200%;
  }
.dark-catalog-page .preloader-copy-col {
    align-items: center;
  }
.dark-catalog-page .preloader-copy p {
    width: 100%;
  }
.dark-catalog-page .preloader-counter {
    align-items: center;
  }
}
.dark-catalog-page .line,
.dark-catalog-page .word,
.dark-catalog-page .char {
  display: inline-block;
  will-change: transform, opacity;
}
.dark-catalog-page [data-copy-scramble]:not(.copy-scramble-ready) {
  visibility: hidden;
}
.dark-catalog-page [data-copy-slide]:not(.copy-slide-ready) {
  visibility: hidden;
}
.dark-catalog-page .fluorescent {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  touch-action: none;
  -webkit-touch-callout: none;
  will-change: transform;
}
.dark-catalog-page .blinding-light {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  flex-direction: column;
  align-items: center;
  overflow: hidden;
  background: var(--base-300);
}
.dark-catalog-page .blinding-light-header {
  position: absolute;
  top: 25%;
  transform: translateY(-50%);
  z-index: 2;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  flex-shrink: 0;
  padding: 2.5rem;
  text-align: center;
}
.dark-catalog-page .blinding-light-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
}
.dark-catalog-page .blinding-light-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2.25rem;
}
.dark-catalog-page .blinding-light-stage {
  position: relative;
  width: 100%;
  flex: 1;
  min-height: 0;
  z-index: 1;
}
.dark-catalog-page .blinding-light-stage canvas {
  display: block;
  width: 100% !important;
  height: 100% !important;
}
.dark-catalog-page .fp-sticky-slider {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
}
.dark-catalog-page .fp-slide-images,
.dark-catalog-page .fp-img,
.dark-catalog-page .fp-img-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
}
.dark-catalog-page .fp-img-container {
  transform: translateZ(0);
  backface-visibility: hidden;
}
.dark-catalog-page .fp-img img,
.dark-catalog-page .fp-slide-masked {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.1s ease-out;
  transform-origin: center center;
  backface-visibility: hidden;
}
.dark-catalog-page .fp-slide-masked {
  -webkit-mask-size: 100% 100%;
  mask-size: 100% 100%;
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
  will-change: transform, mask-image;
}
.dark-catalog-page .fp-slide-info {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100vw;
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
  z-index: 2;
}
.dark-catalog-page .fp-slide-info .container {
  display: flex;
  gap: 2rem;
  padding: 0 2.25rem;
}
.dark-catalog-page .fp-slide-info .container > * {
  flex: 1;
}
.dark-catalog-page .fp-slide-info p,
.dark-catalog-page .fp-slide-link a {
  font-size: 36px;
  font-weight: 500;
  color: #fff;
  line-height: 100%;
  letter-spacing: -0.02rem;
  -webkit-font-smoothing: antialiased;
  will-change: transform;
  text-decoration: none;
}
.dark-catalog-page .fp-slide-link {
  display: flex;
  justify-content: flex-end;
}
.dark-catalog-page .fp-slide-title {
  position: relative;
  flex: 2;
  height: 40px;
  overflow: hidden;
}
.dark-catalog-page .fp-slide-title p {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
@media (max-width: 1000px) {
.dark-catalog-page .fp-slide-title-prefix {
    display: none;
  }
.dark-catalog-page .fp-slide-title {
    height: 22px;
  }
.dark-catalog-page .fp-slide-info p,
.dark-catalog-page .fp-slide-link a {
    font-size: 18px;
  }
}
.dark-catalog-page .team {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: var(--base-200);
}
.dark-catalog-page .team-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  text-align: center;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  pointer-events: none;
}
.dark-catalog-page .team-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 2;
}
.dark-catalog-page .team-footer .container {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 2.25rem;
}
.dark-catalog-page .cards {
  position: absolute;
  top: 20%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 150vw;
  height: 600px;
  will-change: transform;
  z-index: 2;
}
.dark-catalog-page .card {
  position: absolute;
  width: 400px;
  height: 550px;
  left: 50%;
  top: 50%;
  transform-origin: center center;
  margin-left: -150px;
  display: flex;
  flex-direction: column;
  will-change: transform;
  border-radius: 0.5rem;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  backdrop-filter: blur(20px);
  padding: 1rem;
  z-index: 2;
}
.dark-catalog-page .card-img {
  flex: 1;
  overflow: hidden;
  position: relative;
  border-radius: 0.25rem;
  overflow: hidden;
}
.dark-catalog-page .card-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(0.6) brightness(0.9);
  transition: filter 0.4s ease;
}
.dark-catalog-page .card:hover .card-img img {
  filter: saturate(0.85) brightness(1);
}
.dark-catalog-page .card-content {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  padding: 1.25rem 0 0.5rem 0;
}
@media (max-width: 1000px) {
.dark-catalog-page .cards {
    top: 27.5%;
  }
.dark-catalog-page .card {
    width: 260px;
    height: 370px;
    margin-left: -130px;
  }
.dark-catalog-page .team-header h2 {
    font-size: clamp(2rem, 8vw, 3.5rem);
  }
}
.dark-catalog-page .smoke-footer {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  contain: layout style paint;
}
.dark-catalog-page .smoke-footer canvas {
  display: block;
  width: 100%;
  height: 100%;
  background-color: var(--base-300);
}
.dark-catalog-page .footer-content,
.dark-catalog-page .footer-content *,
.dark-catalog-page .footer-bar,
.dark-catalog-page .footer-bar * {
  pointer-events: none;
}
.dark-catalog-page .footer-content {
  position: absolute;
  top: 50%;
  left: 0;
  transform: translateY(-50%);
  width: 100%;
  z-index: 1;
  color: var(--base-100);
}
.dark-catalog-page .footer-content .container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2.5rem;
}
.dark-catalog-page .footer-heading {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  text-align: center;
}
.dark-catalog-page .footer-heading h2 {
  width: 65%;
  max-width: 1500px;
  color: var(--base-100);
}
.dark-catalog-page .footer-bar {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  z-index: 4;
}
.dark-catalog-page .footer-bar .container {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 2.25rem;
}
.dark-catalog-page .footer-bar-left {
  display: flex;
  align-items: center;
}
@media (max-width: 1000px) {
.dark-catalog-page .footer-heading h2 {
    width: 90%;
  }
.dark-catalog-page .footer-bar-right {
    text-align: right;
  }
}
.dark-catalog-page .studio-hero {
  position: relative;
  width: 100%;
  height: 150svh;
  padding: 2rem;
  overflow: hidden;
}
.dark-catalog-page .studio-hero canvas {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
}
.dark-catalog-page .studio-hero-header {
  position: relative;
  z-index: 0;
  text-align: justify;
  pointer-events: none;
  width: 100%;
}
.dark-catalog-page .at-container {
  position: relative;
  width: 100%;
  height: 100svh;
  padding: 2rem;
  background-color: var(--base-300);
  overflow: hidden;
}
.dark-catalog-page .at-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.dark-catalog-page .at-text {
  width: 100%;
}
.dark-catalog-page .at-text .container {
  width: 55%;
}
.dark-catalog-page .at-text p {
  color: var(--base-100);
  text-align: center;
  margin-bottom: 2rem;
  font-size: clamp(1.5rem, 2.5vw, 4.5rem);
  letter-spacing: -2%;
}
.dark-catalog-page .at-word {
  display: inline-block;
  position: relative;
  margin-right: 0.2rem;
  margin-bottom: 0.2rem;
  padding: 0.1rem 0.2rem;
  border-radius: 0.5rem;
  will-change: background-color, opacity;
  opacity: 0;
}
.dark-catalog-page .at-word.at-keyword-wrapper {
  margin: 0 0.4rem 0.2rem 0.2rem;
}
.dark-catalog-page .at-word span {
  position: relative;
  opacity: 0;
}
.dark-catalog-page .at-word span.at-keyword {
  border-radius: 0.5rem;
  display: inline-block;
  width: 100%;
  height: 100%;
  padding: 0.1rem 0;
  color: #141414;
}
.dark-catalog-page .at-word span.at-keyword::before {
  content: "";
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: calc(100% + 1rem);
  height: calc(100% + 0.4rem);
  background-color: var(--kw-color, var(--base-100));
  border-radius: 0.5rem;
  z-index: -1;
}
@media (max-width: 1000px) {
.dark-catalog-page .at-text .container {
    width: 90%;
  }
.dark-catalog-page .at-text p {
    font-size: 1.25rem;
  }
.dark-catalog-page .at-word {
    margin-right: 0.1rem;
    margin-bottom: 0.15rem;
    padding: 0.1rem 0.2rem;
  }
.dark-catalog-page .at-word.at-keyword-wrapper {
    margin: 0 0.2rem 0.1rem 0.1rem;
  }
}
.dark-catalog-page .accordion {
  padding: 12rem 0;
  background-color: var(--base-200);
}
.dark-catalog-page .accordion-header {
  text-align: center;
  padding: 0 2rem 2rem;
}
.dark-catalog-page .accordion-header .mono {
  margin-bottom: 1.5rem;
  color: var(--base-100);
}
.dark-catalog-page .accordion-header h4 {
  max-width: 60rem;
  margin: 0 auto;
}
.dark-catalog-page .accordion-panels {
  width: 100%;
}
.dark-catalog-page .accordion-panels .container {
  display: flex;
  gap: 0.5rem;
  height: 60vh;
  min-height: 500px;
}
.dark-catalog-page .accordion-panel {
  position: relative;
  height: 100%;
  flex: 16 0 0;
  min-width: 0;
  border-radius: 0.25rem;
  overflow: hidden;
  cursor: pointer;
  will-change: flex-grow;
}
.dark-catalog-page .accordion-panel-img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.dark-catalog-page .accordion-panel-overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(11, 11, 11, 0.15) 0%,
    rgba(11, 11, 11, 0.55) 100%
  );
  pointer-events: none;
}
.dark-catalog-page .accordion-panel-content {
  position: absolute;
  z-index: 1;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  pointer-events: none;
}
.dark-catalog-page .accordion-panel-number {
  width: 2.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(255, 255, 255, 0.15);
  background-color: rgba(255, 255, 255, 0.05);
  backdrop-filter: blur(20px);
  border-radius: 5px;
  margin-bottom: 1rem;
  font-size: 0.75rem;
}
.dark-catalog-page .accordion-panel-title {
  font-size: 1.1rem;
  font-weight: 500;
  line-height: 1.2;
  white-space: nowrap;
}
.dark-catalog-page .accordion-panel-desc-wrap {
  position: absolute;
  z-index: 1;
  top: 58%;
  left: 50%;
  transform: translateX(-50%);
  width: 24rem;
  text-align: center;
  pointer-events: none;
}
.dark-catalog-page .accordion-panel-desc {
  font-family: var(--type-2);
  font-size: 0.9rem;
  font-weight: 400;
  line-height: 1.25;
  text-transform: none;
  will-change: opacity, transform;
}
.dark-catalog-page .accordion--stacked {
  padding: 10rem 0 12rem;
}
.dark-catalog-page .accordion--stacked .accordion-header {
  padding-bottom: 3rem;
}
.dark-catalog-page .accordion--stacked .accordion-panels .container {
  flex-direction: column;
  height: auto;
  min-height: 0;
  gap: 1.25rem;
}
.dark-catalog-page .accordion--stacked .accordion-panel {
  flex: none !important;
  height: auto;
  min-height: 0;
  cursor: default;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.dark-catalog-page .accordion--stacked .accordion-panel-img {
  position: relative;
  inset: unset;
  display: block;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  flex-shrink: 0;
  object-fit: cover;
  border-radius: 0.25rem;
}
.dark-catalog-page .accordion--stacked .accordion-panel-overlay {
  inset: unset;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  aspect-ratio: 16 / 9;
  border-radius: 0.25rem;
}
.dark-catalog-page .accordion--stacked .accordion-panel-content {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
  align-items: flex-start;
  text-align: left;
  padding: 2rem 1.75rem 0.75rem;
}
.dark-catalog-page .accordion--stacked .accordion-panel-desc-wrap {
  position: relative;
  top: auto;
  left: auto;
  transform: none;
  width: 100%;
  text-align: left;
  padding: 0 1.75rem 2.25rem;
}
.dark-catalog-page .accordion--stacked .accordion-panel-title {
  white-space: normal;
}
.dark-catalog-page .trail-container {
  position: absolute;
  width: 100%;
  height: 100%;
  overflow: hidden;
  z-index: 2;
}
.dark-catalog-page .trail-img {
  position: absolute;
  width: 175px;
  height: 175px;
  pointer-events: none;
}
.dark-catalog-page .trail-img .mask-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: var(--base-200);
  will-change: clip-path;
}
.dark-catalog-page .trail-img .mask-layer .image-layer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-size: cover;
  background-position: center;
}
.dark-catalog-page {
  min-height: 100svh;
  overflow-x: clip;
}
.dark-catalog-page .page {
  min-height: 100svh;
}
.dark-catalog-page button {
  font: inherit;
}
.dark-catalog-page .trail-img {
  background-size: cover;
  background-position: center;
  opacity: 0;
  clip-path: inset(50% 50% 50% 50%);
  transition: opacity 400ms ease, clip-path 650ms cubic-bezier(0.87, 0, 0.13, 1);
}
`;

export function getDarkCatalogPageStyles(assetBase: string) {
  return DARK_CATALOG_PAGE_STYLES.replaceAll(
    "__ASSET_BASE__",
    assetBase.replace(/\/$/, ""),
  );
}
