/**
 * Scoped stylesheet for the ISOChrome page port. Source rules are nested under
 * `.isochrome-page`; the Druk / Akkurat Mono fonts (renamed to avoid global
 * collisions) resolve against the Blob asset base, and the generic `.container`
 * overrides the host Tailwind container max-width.
 *
 * BLANK - aryank.space
 */

export function getIsochromePageStyles(assetBase: string): string {
  const base = assetBase.replace(/\/$/, "");
  return `
@font-face { font-family: "iso-mono"; src: url("${base}/fonts/akkuratmono.ttf") format("truetype"); font-display: swap; }
@font-face { font-family: "iso-druk-bold"; src: url("${base}/fonts/druk-bold.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "iso-druk-heavy"; src: url("${base}/fonts/druk-heavy.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "iso-druk-medium"; src: url("${base}/fonts/druk-medium.otf") format("opentype"); font-display: swap; }
@font-face { font-family: "iso-druk-super"; src: url("${base}/fonts/druk-super.otf") format("opentype"); font-display: swap; }

.isochrome-page {
  --bg: #1a1a1a;
  --copy: #bac4b8;
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  font-family: "iso-mono", monospace;
  background-color: #000;
  color: var(--copy);
}

.isochrome-page * { margin: 0; padding: 0; box-sizing: border-box; }

.isochrome-page .page {
  width: 100%;
  height: 100%;
  min-height: 100svh;
  background-color: var(--bg);
}
.isochrome-page .container {
  position: relative;
  width: 100%;
  max-width: none;
  height: 100%;
  padding: 20px;
}
.isochrome-page img {
  position: relative;
  width: 100%;
  height: 100%;
  object-fit: cover;
  will-change: transform;
}
.isochrome-page a,
.isochrome-page p {
  position: relative;
  text-decoration: none;
  text-transform: uppercase;
  font-size: 14px;
  color: var(--copy);
  will-change: transform;
}
.isochrome-page h1 {
  position: relative;
  text-transform: uppercase;
  font-family: "iso-druk-heavy";
  font-weight: lighter;
  font-size: 7.5vw;
  line-height: 0.85;
  color: var(--copy);
  will-change: transform;
}
.isochrome-page h2 {
  position: relative;
  text-transform: uppercase;
  font-family: "iso-druk-heavy";
  font-weight: lighter;
  font-size: 4vw;
  line-height: 0.85;
  color: var(--copy);
  will-change: transform;
}
.isochrome-page h3 {
  position: relative;
  text-transform: uppercase;
  font-family: "iso-druk-medium";
  font-weight: lighter;
  font-size: 2.25vw;
  line-height: 0.85;
  color: var(--copy);
  will-change: transform;
}

/* animated text reveal (gsap SplitText mask) */
.isochrome-page .split-line { overflow: hidden; display: block; }
.isochrome-page .split-line-mask { overflow: hidden; display: block; }

/* preloader */
.isochrome-page .pre-loader {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #0f0f0f;
  clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  z-index: 100000;
}
.isochrome-page .progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 7px;
  background-color: var(--copy);
  transform: scaleX(0);
  transform-origin: left;
}

/* home */
.isochrome-page .index-hero {
  position: relative;
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: var(--bg);
  display: flex;
  justify-content: center;
  align-items: center;
}
.isochrome-page .hero-img { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.isochrome-page .hero-header { width: 65%; text-align: center; }
.isochrome-page .hero-header h1 { font-size: 10vw; }
.isochrome-page .hero-footer {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

/* nav */
.isochrome-page nav {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1000;
}
.isochrome-page nav a,
.isochrome-page nav p,
.isochrome-page .menu-overlay-bar a,
.isochrome-page .menu-overlay-bar p,
.isochrome-page .showreel a,
.isochrome-page .media-link a {
  position: relative;
  color: var(--copy);
  display: block;
  will-change: transform;
  user-select: none;
  background: none;
  border: none;
  font-size: 14px;
  text-transform: uppercase;
  cursor: pointer;
}
.isochrome-page .logo,
.isochrome-page .menu-toggle-open,
.isochrome-page .menu-toggle-close,
.isochrome-page .showreel,
.isochrome-page .media-link {
  position: relative;
  width: max-content;
  height: 16px;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
  cursor: pointer;
}
.isochrome-page .menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #0f0f0f;
  clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  will-change: clip-path;
  pointer-events: none;
  z-index: 2000;
}
.isochrome-page .menu-overlay-bar {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.isochrome-page .menu-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  width: 100%;
  padding: 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.isochrome-page .socials { display: flex; gap: 1em; }
.isochrome-page nav a,
.isochrome-page .menu-toggle-open p { transform: translateY(0px); }
.isochrome-page .menu-overlay-bar a,
.isochrome-page .menu-toggle-close p,
.isochrome-page .showreel a,
.isochrome-page .media-link a { transform: translateY(20px); }
.isochrome-page .menu-links {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}
.isochrome-page .menu-link { position: relative; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); }
.isochrome-page .menu-link a { position: relative; display: inline-block; transform: translateY(100%); will-change: transform; }
.isochrome-page .menu-overlay h1 {
  text-transform: uppercase;
  font-family: "iso-druk-heavy";
  font-weight: lighter;
  font-size: 8vw;
  line-height: 0.85;
  color: var(--copy);
}

/* about */
.isochrome-page .about-hero { position: relative; width: 100%; height: 125svh; overflow: hidden; background-color: var(--bg); }
.isochrome-page .about-hero-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.isochrome-page .about-hero .container { padding-top: 4em; display: flex; flex-direction: column; justify-content: space-between; }
.isochrome-page .about-hero .container h1 { font-size: 10vw; width: 70%; }
.isochrome-page .about-tagline { display: flex; gap: 2em; width: 75%; }
.isochrome-page .about-tagline .col:nth-child(1) { flex: 6; }
.isochrome-page .about-tagline .col:nth-child(2) { flex: 2; }
.isochrome-page .about-copy { position: relative; width: 100%; padding: 8em 0; }
.isochrome-page .about-copy .container { width: 50%; margin: 0 auto; }
.isochrome-page .about-copy-wrapper { margin-top: 2em; }
.isochrome-page .about-copy-img { position: relative; width: 100%; height: 500px; overflow: hidden; }
.isochrome-page .about-copy-img-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.isochrome-page .about-copy-img-wrapper img { position: absolute; }
.isochrome-page .about-copy h2 { font-family: "iso-druk-heavy"; }
.isochrome-page .about-copy p { margin-bottom: 2em; }
.isochrome-page section.expertise { position: relative; width: 100%; min-height: 100svh; }
.isochrome-page .expertise-header { position: absolute; padding-top: 4em; top: 0; left: 0; width: 100%; height: 100svh; overflow: hidden; will-change: transform; }
.isochrome-page .expertise-header .container { display: flex; flex-direction: column; justify-content: space-between; }
.isochrome-page .expertise-header .row { display: flex; justify-content: space-between; }
.isochrome-page .expertise-img-1 { position: relative; width: 15%; overflow: hidden; }
.isochrome-page .expertise-img-2 { width: 30%; }
.isochrome-page .services { position: relative; width: 50%; margin: 0 auto; display: flex; padding: 5.5em 0 1em 0; will-change: transform; }
.isochrome-page .services .col { flex: 1; }
.isochrome-page .service h3 { margin-bottom: 0.5em; }
.isochrome-page .service h2 { margin-bottom: 0.5em; font-family: "iso-druk-heavy"; }
.isochrome-page .service:not(:last-child) { margin-bottom: 8em; }
.isochrome-page .about-outro-banner { position: relative; width: 100%; height: 75vh; overflow: hidden; margin: 8em 0 0 0; background-color: var(--bg); }
.isochrome-page .about-outro-img { position: relative; width: 100%; height: 100%; }
.isochrome-page .founder-voice { position: relative; width: 100%; padding: 8em 0; }
.isochrome-page .founder-voice .container { width: 50%; margin: 0 auto; border-left: 1px solid rgba(255, 255, 255, 0.125); }
.isochrome-page .founder-voice .container h2 { margin-bottom: 3em; }
.isochrome-page .founder-image { width: 200px; margin-bottom: 20px; }
.isochrome-page .client-logos { position: relative; width: 100%; padding: 6em 0; background-color: var(--bg); overflow-x: hidden; }
.isochrome-page .client-logos .container { width: 100%; margin: 0 auto; overflow: hidden; }
.isochrome-page .logos-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; width: 100%; }
.isochrome-page .logo-item { aspect-ratio: 5 / 3; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; padding: 1em 0; border-top: 1px solid rgba(255, 255, 255, 0.125); width: 100%; }
.isochrome-page .logo-details { width: 100%; display: flex; justify-content: space-between; align-items: center; }
.isochrome-page .logo-details p:nth-child(1) { font-size: 20px; }
.isochrome-page .logo-item img { width: 20%; height: auto; object-fit: contain; margin-top: 20px; }

/* work */
.isochrome-page .work-hero { position: relative; width: 100%; height: 100svh; overflow: hidden; background-color: var(--bg); }
.isochrome-page .work-hero .container { width: 50%; margin: 0 auto; padding: 4em 0; display: flex; flex-direction: column; justify-content: space-between; text-align: center; }
.isochrome-page .work-hero h1 { font-size: 15vw; text-align: center; }
.isochrome-page .work-hero p { width: 35%; margin: 0 auto; }
.isochrome-page .projects { position: relative; width: 100%; height: 100%; }
.isochrome-page .project { position: relative; width: 100%; height: 100svh; overflow: hidden; }
.isochrome-page .project-banner-img { position: relative; width: 100%; height: 100%; overflow: hidden; display: flex; justify-content: center; align-items: center; }
.isochrome-page .project-banner-img img { position: absolute; will-change: transform, scale; }
.isochrome-page .project-title { position: relative; z-index: 2; }

/* project */
.isochrome-page .project-hero { position: relative; width: 100%; height: 100svh; overflow: hidden; display: flex; margin-bottom: 8em; }
.isochrome-page .project-hero .col { flex: 1; }
.isochrome-page .project-hero-img { position: relative; width: 100%; height: 100%; overflow: hidden; }
.isochrome-page .project-hero-img-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.isochrome-page .project-hero .col:nth-child(2) .container { display: flex; flex-direction: column; justify-content: center; padding: 4em; }
.isochrome-page .project-page-title h1 { margin-bottom: 1em; width: 75%; }
.isochrome-page .project-hero .sub-col h3 { margin: 0.25em 0; }
.isochrome-page .project-hero .col:nth-child(2) .container .row { display: flex; gap: 2em; margin-bottom: 2em; }
.isochrome-page .project-hero .col:nth-child(2) .container .row .sub-col { flex: 1; }
.isochrome-page .project-info { position: relative; width: 100%; padding: 4em 0 4em 0; }
.isochrome-page .project-info .container { width: 80%; margin: 0 auto; display: flex; }
.isochrome-page .project-info .container .col { flex: 1; }
.isochrome-page .project-info .container .col p { margin-bottom: 3em; }
.isochrome-page .project-info-img-1 { position: relative; width: 100%; height: 700px; overflow: hidden; }
.isochrome-page .project-info-img-1-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.isochrome-page .stat { border-top: 1px solid rgba(255, 255, 255, 0.125); display: flex; padding-top: 20px; justify-content: space-between; margin-bottom: 8em; }
.isochrome-page .stat h1 { font-size: 15vw; }
.isochrome-page .project-preview-img { position: relative; width: 100%; height: 100svh; overflow: hidden; }
.isochrome-page .project-preview-img-wrapper { position: relative; width: 100%; height: 100%; overflow: hidden; }
.isochrome-page .project-info-outro { padding: 10em 0; }

/* contact */
.isochrome-page .contact-hero { position: relative; width: 100%; height: 90svh; overflow: hidden; background-color: var(--bg); }
.isochrome-page .contact-hero .container { display: flex; align-items: flex-end; height: 100%; }
.isochrome-page .contact-details { padding: 8em 0; }
.isochrome-page .contact-details .container { display: flex; flex-direction: column; gap: 4em; }
.isochrome-page .contact-details .row:not(:last-child) { border-bottom: 1px solid rgba(255, 255, 255, 0.125); }
.isochrome-page .contact-details .row { display: flex; gap: 2em; padding-bottom: 4em; }
.isochrome-page .contact-details .row:last-child { padding-bottom: 2em; }
.isochrome-page .contact-details .row .col { flex: 1; display: flex; gap: 2em; }
.isochrome-page .contact-details .row .col .sub-col { flex: 1; }
.isochrome-page .contact-banner { position: relative; width: 100%; height: 100svh; overflow: hidden; display: flex; justify-content: center; align-items: center; text-align: center; }
.isochrome-page .contact-banner-bg { position: absolute; top: 0; left: 0; width: 100%; height: 100%; }
.isochrome-page .contact-banner-cta { position: relative; z-index: 2; }

/* footer */
.isochrome-page .footer { position: relative; width: 100%; overflow-x: hidden; background-color: #0f0f0f; padding-top: 6em; }
.isochrome-page .footer .container { display: flex; justify-content: flex-end; flex-direction: column; gap: 4em; }
.isochrome-page .footer-content { width: 100%; display: flex; }
.isochrome-page .footer-content > div { flex: 1; }
.isochrome-page .footer .col h3 { font-family: "iso-druk-medium"; width: 40%; margin-bottom: 1.5em; }
.isochrome-page .footer .subscribe-form { width: 65%; padding: 1em 0; display: flex; align-items: center; gap: 1em; border-bottom: 1px solid rgba(255, 255, 255, 0.125); }
.isochrome-page .footer .subscribe-form input { background: none; width: 100%; outline: none; border: none; text-transform: uppercase; font-family: "iso-mono"; font-size: 14px; color: var(--copy); padding: 10px 0; }
.isochrome-page .footer .subscribe-form ::placeholder { text-transform: uppercase; font-family: "iso-mono"; font-size: 14px; color: var(--copy); opacity: 0.5; }
.isochrome-page .footer .subscribe-form button { border: none; outline: none; background-color: var(--copy); color: var(--bg); font-family: "iso-druk-bold"; font-size: 20px; padding: 10px 20px; text-transform: uppercase; cursor: pointer; }
.isochrome-page .footer-content .col:nth-child(2) { display: flex; flex-direction: column; justify-content: space-between; align-items: flex-end; gap: 8em; }
.isochrome-page .footer-content .col:nth-child(2) .row { width: 90%; display: flex; }
.isochrome-page .location { flex: 1; }
.isochrome-page .langs,
.isochrome-page .footer-socials { flex: 1; display: flex; gap: 2em; }
.isochrome-page .langs p:nth-child(2) { opacity: 0.5; }
.isochrome-page .location h3 { width: 100%; margin-bottom: 0.75em !important; }
.isochrome-page .footer-logo h1 { font-size: 27vw; text-align: center; clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%); overflow: hidden; }
.isochrome-page .footer-logo-char { position: relative; display: inline-block; will-change: transform, opacity; }
.isochrome-page .footer-copyright { width: 100%; display: flex; justify-content: space-between; align-items: center; }

@media (max-width: 900px) {
  .isochrome-page h1 { font-size: 12vw; }
  .isochrome-page h2 { font-size: 10vw; }
  .isochrome-page h3 { font-size: 8vw; }
  .isochrome-page .hero-header { width: 90%; }
  .isochrome-page .hero-header h1 { font-size: 20vw; }
  .isochrome-page .menu-overlay h1 { font-size: 20vw; }
  .isochrome-page .about-hero { height: 100svh; }
  .isochrome-page .about-hero .container h1 { width: 80%; font-size: 15vw; }
  .isochrome-page .about-tagline { width: 100%; flex-direction: column; gap: 1em; }
  .isochrome-page .about-copy .container { width: 100%; }
  .isochrome-page .expertise-header .container { justify-content: flex-start; gap: 2em; }
  .isochrome-page .expertise-img-1 { display: none; }
  .isochrome-page .expertise-img-2 { width: 100%; }
  .isochrome-page .services { width: 100%; padding: 70vh 20px 4em 20px; }
  .isochrome-page .service:not(:last-child) { margin-bottom: 4em; }
  .isochrome-page .services .col:nth-child(1) { display: none; }
  .isochrome-page .founder-voice .container { width: 95%; }
  .isochrome-page .client-logos .container { width: 100%; padding: 0 20px; }
  .isochrome-page .logos-grid { grid-template-columns: repeat(2, 1fr); gap: 10px; }
  .isochrome-page .logo-details { padding: 0 10px; justify-content: center; }
  .isochrome-page .logo-details p:nth-child(1) { display: none; }
  .isochrome-page .logo-item { aspect-ratio: 1; }
  .isochrome-page .work-hero .container { width: 75%; padding: 8em 0 4em 0; }
  .isochrome-page .work-hero h1 { font-size: 20vw; }
  .isochrome-page .work-hero p { width: 100%; }
  .isochrome-page .project-hero { height: 200svh; flex-direction: column-reverse; }
  .isochrome-page .project-hero .col:nth-child(2) .container { padding: 20px; }
  .isochrome-page .project-hero .col:nth-child(2) .container .row { flex-direction: column; }
  .isochrome-page .project-page-title h1 { margin-bottom: 2em; }
  .isochrome-page .project-info .container { width: 100%; flex-direction: column; gap: 2em; }
  .isochrome-page .stat h1 { font-size: 20vw; }
  .isochrome-page .contact-details .row,
  .isochrome-page .contact-details .row .col { flex-direction: column; }
  .isochrome-page .contact-details .row .col { gap: 1em; }
  .isochrome-page .footer-content { flex-direction: column; gap: 4em; }
  .isochrome-page .footer .col h3 { margin-bottom: 0.75em; width: 100%; }
  .isochrome-page .footer .subscribe-form { width: 100%; }
  .isochrome-page .footer-content .col:nth-child(2) .row { flex-direction: column; width: 100%; gap: 2em; }
  .isochrome-page .langs { display: none; }
  .isochrome-page .footer-content .col:nth-child(2) { flex-direction: column-reverse; gap: 2em; }
  .isochrome-page .footer-logo h1 { font-size: 25vw; }
  .isochrome-page .footer-copyright { flex-direction: column; align-items: flex-start; }
}
`;
}
