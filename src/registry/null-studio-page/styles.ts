/**
 * Scoped stylesheet for the Null Studio page port. Source rules are nested
 * under `.null-studio-page`; fonts resolve against the Blob asset base and the
 * generic `.container` overrides the host Tailwind container max-width.
 *
 * BLANK - aryank.space
 */

export function getNullStudioPageStyles(assetBase: string): string {
  const base = assetBase.replace(/\/$/, "");
  return `
@import url("https://fonts.googleapis.com/css2?family=Teko:wght@300;400;500;600;700&display=swap");

@font-face { font-family: "Cosi Times"; src: url("${base}/fonts/CosiTimes-Light.ttf") format("truetype"); font-weight: 300; font-display: swap; }
@font-face { font-family: "Cosi Times"; src: url("${base}/fonts/CosiTimes-Roman.ttf") format("truetype"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Cosi Times"; src: url("${base}/fonts/CosiTimes-Bold.ttf") format("truetype"); font-weight: 700; font-display: swap; }
@font-face { font-family: "PP Eiko"; src: url("${base}/fonts/PPEiko-Light.otf") format("opentype"); font-weight: 300; font-display: swap; }
@font-face { font-family: "PP Eiko"; src: url("${base}/fonts/PPEiko-Regular.otf") format("opentype"); font-weight: 400; font-display: swap; }
@font-face { font-family: "PP Eiko"; src: url("${base}/fonts/PPEiko-Medium.otf") format("opentype"); font-weight: 500; font-display: swap; }
@font-face { font-family: "PP Neue Montreal"; src: url("${base}/fonts/NeueMontreal-Light.otf") format("opentype"); font-weight: 300; font-display: swap; }
@font-face { font-family: "PP Neue Montreal"; src: url("${base}/fonts/NeueMontreal-Regular.otf") format("opentype"); font-weight: 400; font-display: swap; }
@font-face { font-family: "PP Neue Montreal"; src: url("${base}/fonts/NeueMontreal-Medium.otf") format("opentype"); font-weight: 500; font-display: swap; }

.null-studio-page {
  --color-bg: #fff;
  --color-text: #0a0a0a;
  --font-accent: "Cosi Times";
  --font-sans-serif: "PP Neue Montreal";
  --font-serif: "PP Eiko";
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--color-bg);
  font-family: var(--font-sans-serif);
}

.null-studio-page * { margin: 0; padding: 0; box-sizing: border-box; }

.null-studio-page .container {
  width: 100%;
  max-width: none;
  height: 100%;
  padding: 2rem;
}
.null-studio-page h1 { color: var(--color-text); }
.null-studio-page p,
.null-studio-page span,
.null-studio-page a {
  font-size: 1rem;
  line-height: 120%;
  color: var(--color-text);
}
.null-studio-page span { font-family: var(--font-serif); }
.null-studio-page a { text-decoration: none; color: var(--color-text); }
.null-studio-page img { width: 100%; height: 100%; object-fit: cover; }

.null-studio-page footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.null-studio-page footer p,
.null-studio-page footer a {
  font-size: 1.25rem;
  text-transform: uppercase;
  font-family: var(--font-accent);
}
.null-studio-page footer#light p,
.null-studio-page footer#light a { color: var(--color-bg); }
.null-studio-page p#address { font-family: var(--font-sans-serif); }
.null-studio-page footer a { font-family: var(--font-sans-serif); }

/* menu */
.null-studio-page .menu-toggle {
  position: fixed;
  top: 0;
  right: 0;
  padding: 0 2rem;
  z-index: 10000;
  cursor: pointer;
}
.null-studio-page .menu-toggle .toggle-icon {
  transition: transform 0.5s;
  display: inline-block;
}
.null-studio-page .menu-toggle.open .toggle-icon {
  transform: rotate(45deg);
}
.null-studio-page .menu-toggle .toggle-icon span {
  color: #000;
  font-size: 6rem;
  font-family: var(--font-accent);
  transition: color 0.5s;
}
.null-studio-page .menu-toggle.open .toggle-icon span { color: #fff; }
.null-studio-page .menu {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100vh;
  background: rgba(0, 0, 0, 0.95);
  backdrop-filter: blur(20px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  opacity: 0;
  pointer-events: none;
  z-index: 2000;
  transition: opacity 0.5s;
}
.null-studio-page .menu.open { opacity: 1; pointer-events: all; }
.null-studio-page .menu-link {
  position: relative;
  width: 100%;
  text-align: center;
  left: 2rem;
  transition: all 0.3s;
  margin: 0;
}
.null-studio-page .menu-link:hover { left: -1rem; }
.null-studio-page .menu-link a {
  font-family: var(--font-accent);
  font-size: 5rem;
  text-align: center;
  color: var(--color-bg);
  line-height: 0;
}
.null-studio-page .menu-link span {
  font-family: var(--font-accent);
  font-size: 5rem;
  color: var(--color-bg);
  padding: 0 0.5rem;
  opacity: 0;
  transition: all 0.3s;
}
.null-studio-page .menu-link:hover span { opacity: 1; }

/* home / articles */
.null-studio-page #home .header {
  width: 75%;
  display: flex;
  gap: 2rem;
  margin-bottom: 2rem;
}
.null-studio-page .header .hero-logo a {
  font-size: 8rem;
  font-weight: 500;
  font-family: var(--font-accent);
  text-transform: uppercase;
  line-height: 75%;
}
.null-studio-page .header .hero-copy { margin-bottom: 0.5rem; }
.null-studio-page .header .hero-copy p,
.null-studio-page .header .hero-copy span {
  font-size: 1.5rem;
  color: var(--color-text);
}
.null-studio-page .header .hero-copy p { font-weight: 500; }
.null-studio-page .header .hero-copy span { font-style: italic; font-weight: 400; }
.null-studio-page .article {
  display: flex;
  flex-direction: column;
  width: 100%;
  margin-bottom: 3rem;
}
.null-studio-page .article .article-img { width: 100%; height: 700px; }
.null-studio-page .article-copy {
  display: flex;
  gap: 1rem;
  width: 85%;
  margin: 1rem 0;
}
.null-studio-page .article-title { flex-shrink: 0; }
.null-studio-page .article-title p { margin: 1rem 0 0.75rem 0; }
.null-studio-page .article-title p a {
  font-size: 3.5rem;
  font-family: var(--font-accent);
  text-transform: uppercase;
}
.null-studio-page .article-title span { font-style: italic; font-size: 1rem; }
.null-studio-page #hero-article .article-title { margin-right: 3rem; }
.null-studio-page #hero-article .article-text p { margin: 1rem 0 0.75rem 0; }
.null-studio-page .article-text p { font-size: 1.5rem; }
.null-studio-page .article-link {
  width: max-content;
  margin: 1rem 0;
  padding: 0.25rem 0.75rem;
  border: 1px solid var(--color-text);
  border-radius: 2rem;
  cursor: pointer;
}
.null-studio-page .article-link:hover { background: var(--color-text); }
.null-studio-page .article-link:hover a { color: var(--color-bg); }
.null-studio-page .article-row {
  margin: 2rem 0;
  width: 100%;
  display: flex;
  gap: 2rem;
}
.null-studio-page .article-col .article-copy { flex-direction: column; width: 100%; }
.null-studio-page .article-col { flex: 1; }
.null-studio-page #article-img-2 { height: 800px; }
.null-studio-page #article-img-3 { height: 300px; }
.null-studio-page .work-container { margin: 2rem 0; }

/* about */
.null-studio-page .about-hero-img { width: 100%; height: 700px; margin: 2rem 0; }
.null-studio-page .about-copy { width: 100%; display: flex; margin-bottom: 3rem; }
.null-studio-page .about-copy > div { flex: 1; }
.null-studio-page .about-copy-col h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 4rem;
}
.null-studio-page .about-copy-col p { font-size: 1.4rem; font-weight: 400; }
.null-studio-page .about-copy .about-copy-col:nth-child(2) { padding-right: 10rem; }
.null-studio-page .services { margin: 2rem 0 6rem 0; }
.null-studio-page .services-cols { width: 100%; display: flex; gap: 2rem; margin: 2rem 0; }
.null-studio-page .services-cols > div { flex: 1; }
.null-studio-page .services h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 4rem;
}
.null-studio-page .service h1 {
  font-family: var(--font-sans-serif);
  font-size: 2rem;
  text-transform: capitalize;
  margin: 1rem 0;
}
.null-studio-page .service p { font-family: var(--font-serif); font-style: italic; font-size: 1.25rem; }
.null-studio-page .clients { width: 100%; background: var(--color-text); padding: 3rem 2rem; }
.null-studio-page .clients h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 4rem;
  color: var(--color-bg);
  margin: 1rem 0 2rem 0;
}
.null-studio-page .clients-container { width: 75%; margin: 3rem auto 6rem auto; }
.null-studio-page .c-row { display: flex; gap: 2rem; margin: 1rem 0; }
.null-studio-page .c-item {
  width: 25%;
  padding: 2rem;
  height: 150px;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* team carousel */
.null-studio-page .slider-wrapper { padding: 4rem 2rem; background: var(--color-text); }
.null-studio-page .slider-wrapper h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 4rem;
  color: var(--color-bg);
  margin: 1rem 0 3rem 0;
}
.null-studio-page .wrapper { width: 100%; position: relative; padding: 0 0.5rem; }
.null-studio-page .wrapper .arrow {
  top: 40%;
  padding: 0 1rem;
  position: absolute;
  transform: translateY(-50%);
  transition: transform 0.1s linear;
  color: #fff;
  background: none;
  border: none;
  cursor: pointer;
  z-index: 3;
}
.null-studio-page .wrapper .arrow svg { width: 3rem; height: 3rem; stroke: #fff; }
.null-studio-page .wrapper .arrow:active { transform: translateY(-50%) scale(0.85); }
.null-studio-page .wrapper .arrow.left { left: 0; }
.null-studio-page .wrapper .arrow.right { right: 0; }
.null-studio-page .wrapper .carousel {
  display: grid;
  grid-auto-flow: column;
  grid-auto-columns: calc((100% / 4) - 12px);
  overflow-x: auto;
  scroll-snap-type: x mandatory;
  gap: 1rem;
  scroll-behavior: smooth;
  scrollbar-width: none;
}
.null-studio-page .carousel::-webkit-scrollbar { display: none; }
.null-studio-page .carousel.dragging { scroll-snap-type: none; scroll-behavior: auto; cursor: grabbing; }
.null-studio-page .carousel .card {
  scroll-snap-align: start;
  height: 600px;
  list-style: none;
  cursor: pointer;
  padding-bottom: 15px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.null-studio-page .carousel .card .img { height: 500px; width: 100%; }
.null-studio-page .carousel .card h2 {
  font-weight: 400;
  font-size: 1.5rem;
  margin: 1.5rem 0 0.5rem 0;
  color: var(--color-bg);
}
.null-studio-page .carousel .card span { color: var(--color-bg); font-style: italic; font-size: 1.25rem; }

/* careers */
.null-studio-page .cards { margin: 2rem 0; width: 100%; display: flex; flex-wrap: wrap; gap: 1rem; }
.null-studio-page .cards .card {
  width: 25%;
  height: 500px;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border: 1.5px solid var(--color-text);
  transition: 0.3s all;
  cursor: pointer;
}
.null-studio-page .cards .card:hover { background: var(--color-text); color: var(--color-bg); }
.null-studio-page .cards .card:hover h1,
.null-studio-page .cards .card:hover p { color: var(--color-bg); }
.null-studio-page .card-title h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 3rem;
}
.null-studio-page .card-location { display: flex; justify-content: space-between; }
.null-studio-page .card-location p { font-size: 1.5rem; font-weight: 500; }
.null-studio-page p.expand-sign { font-family: var(--font-accent); }

/* contact */
.null-studio-page .tiles { width: 100%; display: flex; margin: 2rem 0; gap: 1rem; height: calc(95vh - 10rem); }
.null-studio-page .tile { width: 100%; height: 100%; display: flex; flex-direction: column; gap: 1rem; flex: 1; }
.null-studio-page .tile-1,
.null-studio-page .tile-2 {
  width: 100%;
  height: 100%;
  flex: 1;
  border: 1.5px solid var(--color-text);
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 1rem;
}
.null-studio-page .tile h1 {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 3rem;
}
.null-studio-page .tile a { font-size: 1.25rem; font-weight: 400; }
.null-studio-page .tile-1 { background: var(--color-text); color: var(--color-bg); }
.null-studio-page .tile-1 h1,
.null-studio-page .tile-1 p,
.null-studio-page .tile-1 a { color: var(--color-bg); }
.null-studio-page .tile-links { display: flex; flex-direction: column; text-decoration: underline; }
.null-studio-page .tile-1 a,
.null-studio-page .tile-2 a { text-transform: uppercase; font-weight: 400; }

/* work sample */
.null-studio-page .video-container { width: 100%; margin: 2rem auto; position: relative; display: flex; flex-direction: column; justify-content: center; }
.null-studio-page .video-container .video-wrapper { width: 100%; height: 100%; display: flex; justify-content: center; align-items: center; }
.null-studio-page .video-container video { width: 100%; height: 100%; }
.null-studio-page .play-button-wrapper {
  position: absolute;
  top: 0; left: 0; right: 0; bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}
.null-studio-page .play-button-wrapper .circle-play-b { cursor: pointer; pointer-events: auto; background: none; border: none; transition: opacity 0.3s; }
.null-studio-page .play-button-wrapper .circle-play-b svg { width: 100px; height: 100px; fill: #fff; }
.null-studio-page .article-text h3 { font-weight: 500; font-size: 2rem; margin-bottom: 1rem; }
.null-studio-page #article-work-copy { width: 90%; }
.null-studio-page #article-work-copy .article-title { margin-right: 4rem; }
.null-studio-page .collapsible {
  position: relative;
  overflow: hidden;
  transition: max-height 0.5s ease-out;
  max-height: 4.5rem;
}
.null-studio-page .collapsible.open { max-height: 40rem; }
.null-studio-page .img-row { width: 100%; display: flex; gap: 2rem; margin: 2rem 0; }
.null-studio-page .img-row > div { flex: 1; }
.null-studio-page .project-img { height: 500px; }
.null-studio-page .work-page { margin-bottom: 4rem; }
.null-studio-page .work-page h1 a {
  line-height: 100%;
  text-transform: uppercase;
  font-family: var(--font-accent);
  font-weight: 400;
  font-size: 4rem;
}

@media (max-width: 900px) {
  .null-studio-page footer { flex-direction: column; }
  .null-studio-page .menu-link a { font-size: 3.5rem; }
  .null-studio-page #home .header { width: 100%; flex-direction: column; gap: 1rem; margin-bottom: 5rem; }
  .null-studio-page .header .hero-copy { margin-top: 1rem; }
  .null-studio-page .header .hero-logo a { font-size: 4rem; }
  .null-studio-page .article-copy { width: 100%; flex-direction: column; }
  .null-studio-page .article-title p { font-size: 2.5rem; }
  .null-studio-page .article-text p { font-size: 1.25rem; }
  .null-studio-page .article-row { flex-direction: column; }
  .null-studio-page .about-copy .about-copy-col:nth-child(2) { padding-right: 0; }
  .null-studio-page .about-copy { flex-direction: column; gap: 2rem; }
  .null-studio-page .services-cols { flex-direction: column; }
  .null-studio-page .c-row { flex-direction: column; }
  .null-studio-page .c-item { width: 100%; }
  .null-studio-page .wrapper .carousel { grid-auto-columns: calc((100% / 2) - 9px); }
  .null-studio-page .cards { flex-direction: column; }
  .null-studio-page .cards .card { width: 100%; }
  .null-studio-page .tiles { flex-direction: column; height: auto; }
}
`;
}
