/**
 * Scoped stylesheet for the Unusual Studio page port. Source rules are nested
 * under `.unusual-studio-page`; the locomotive-scroll runtime CSS is dropped in
 * favour of native container scroll (the sticky sections use native
 * position:sticky). Fonts and background images resolve against the Blob asset
 * base.
 *
 * BLANK - aryank.space
 */

export function getUnusualStudioPageStyles(assetBase: string): string {
  const base = assetBase.replace(/\/$/, "");
  return `
@font-face {
  font-family: "Neue Montreal";
  src: url("${base}/fonts/NeueMontreal-Light.otf") format("opentype");
  font-weight: 300;
  font-display: swap;
}
@font-face {
  font-family: "Neue Montreal";
  src: url("${base}/fonts/NeueMontreal-Regular.otf") format("opentype");
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: "Neue Montreal";
  src: url("${base}/fonts/NeueMontreal-Medium.otf") format("opentype");
  font-weight: 700;
  font-display: swap;
}
@font-face {
  font-family: "Neue Montreal";
  src: url("${base}/fonts/NeueMontreal-Bold.otf") format("opentype");
  font-weight: 800;
  font-display: swap;
}

.unusual-studio-page {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  background: #000;
  color: #fff;
  font-family: "Neue Montreal", system-ui, sans-serif;
}

.unusual-studio-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.unusual-studio-page section {
  width: 100%;
  padding: 2em;
}
.unusual-studio-page h1 {
  font-weight: 400;
  font-size: 48px;
  line-height: 100%;
  text-transform: uppercase;
}
.unusual-studio-page p {
  font-weight: 400;
  font-size: 14px;
  text-transform: uppercase;
  line-height: 120%;
}
.unusual-studio-page a {
  text-decoration: none;
  text-transform: uppercase;
  color: inherit;
}
.unusual-studio-page span {
  text-transform: uppercase;
  font-size: 12px;
}
.unusual-studio-page img {
  display: block;
}

/* transition */
.unusual-studio-page .slide-in {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background: #fff;
  transform-origin: left;
  z-index: 100000;
  pointer-events: none;
}
.unusual-studio-page .slide-in-text {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) !important;
  color: #fff;
  opacity: 0;
  z-index: 1000000000;
  pointer-events: none;
  text-transform: uppercase;
  font-size: 100px;
}
.unusual-studio-page .slide-out {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background: #fff;
  transform-origin: right;
  z-index: 1000000;
  pointer-events: none;
}

/* nav */
.unusual-studio-page .nav {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2em;
  mix-blend-mode: difference;
  z-index: 100;
}
.unusual-studio-page .nav .nav-items {
  display: flex;
}
.unusual-studio-page .nav .nav-items .nav-item {
  padding: 0.125em;
  margin-right: 0.5em;
}
.unusual-studio-page .nav .logo {
  padding: 0.125em;
}
.unusual-studio-page .nav .logo a,
.unusual-studio-page .nav .nav-items .nav-item a {
  font-size: 12px;
  text-decoration: none;
  color: #fff;
  text-transform: uppercase;
}

/* hero-img */
.unusual-studio-page section.hero-img {
  position: relative;
  padding: 0;
  height: 100vh;
  overflow: hidden;
}
.unusual-studio-page section.hero-img .hero-img-container {
  width: 100%;
  height: 100%;
}
.unusual-studio-page section.hero-img .hero-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.unusual-studio-page section.hero-img .hero-img-copy {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #fff;
  text-align: center;
  mix-blend-mode: difference;
}
.unusual-studio-page .hero-img-copy-h1 h1 {
  font-size: 200px;
  color: #fff;
}

/* projects */
.unusual-studio-page .projects {
  padding-top: 20em;
}
.unusual-studio-page section.projects .projects-copy {
  width: 100%;
  display: flex;
  margin-bottom: 2em;
}
.unusual-studio-page section.projects .projects-copy .projects-copy-h1 {
  flex: 3;
}
.unusual-studio-page section.projects .projects-copy .projects-copy-ws {
  flex: 2;
}
.unusual-studio-page .projects-list {
  padding: 0;
  margin: 0;
  list-style: none;
  display: flex;
  justify-content: space-around;
}
.unusual-studio-page .projects-list a {
  width: 100%;
}
.unusual-studio-page .projects-list .project {
  margin: 5px;
  color: white;
  font-weight: bold;
  font-size: 1.5em;
  text-align: center;
  flex: 1 0 auto;
  aspect-ratio: 1 / 1;
  display: flex;
  flex-direction: column;
  margin-bottom: 2em;
}
.unusual-studio-page .projects-list .project .project-img {
  width: 100%;
  height: 100%;
  margin-bottom: 0.5em;
}
.unusual-studio-page .projects-list .project .project-img-1 {
  background: url("${base}/images/project-img-1.jpg") no-repeat 50% 50%;
  background-size: cover;
}
.unusual-studio-page .projects-list .project .project-img-2 {
  background: url("${base}/images/project-img-2.jpg") no-repeat 50% 50%;
  background-size: cover;
}
.unusual-studio-page .projects-list .project .project-img-3 {
  background: url("${base}/images/project-img-3.jpg") no-repeat 50% 50%;
  background-size: cover;
}
.unusual-studio-page .projects-list .project .project-img-4 {
  background: url("${base}/images/project-img-4.jpg") no-repeat 50% 50%;
  background-size: cover;
}
.unusual-studio-page .projects-list .project .project-name p {
  font-weight: 500;
}
.unusual-studio-page .projects-list .project .project-name p,
.unusual-studio-page .projects-list .project .project-category p {
  text-transform: uppercase;
  font-size: 14px;
  color: #fff;
  text-decoration: none;
}

/* article */
.unusual-studio-page .article-container {
  width: 100%;
  height: 700px;
  background: url("${base}/images/article-img.jpg") no-repeat 50% 50%;
  background-size: cover;
  display: flex;
  justify-content: center;
  align-items: center;
}
.unusual-studio-page .article-container .article-container-copy {
  width: 80%;
  text-align: center;
  color: #fff;
  display: flex;
  flex-direction: column;
  gap: 2em;
}
.unusual-studio-page .article-container .article-container-copy a {
  text-transform: uppercase;
  color: #fff;
  text-decoration: none;
  font-weight: 400;
  font-size: 14px;
}

/* services */
.unusual-studio-page section.services {
  display: flex;
  align-items: flex-end;
  margin-top: 10em;
}
.unusual-studio-page section.services .services-copy-h1 {
  flex: 5;
}
.unusual-studio-page section.services .services-copy-p {
  flex: 2;
}

/* feature img */
.unusual-studio-page section.feature-img {
  padding: 0;
  height: 800px;
}
.unusual-studio-page section.feature-img .feature-img-container {
  width: 100%;
  height: 100%;
}
.unusual-studio-page section.feature-img .feature-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* clients */
.unusual-studio-page section.clients .client-copy {
  display: flex;
  margin-top: 2em;
}
.unusual-studio-page section.clients .client-copy .client-copy-p {
  flex: 2;
  padding: 0 10em;
  margin-bottom: 12em;
}
.unusual-studio-page section.clients .client-copy .client-copy-p p {
  font-size: 14px;
}

/* logos marquee */
.unusual-studio-page section.logos {
  padding: 0;
  overflow: hidden;
}
.unusual-studio-page .us-marquee {
  display: flex;
  width: max-content;
  animation: us-marquee 22s linear infinite;
}
@keyframes us-marquee {
  from { transform: translateX(0); }
  to { transform: translateX(-50%); }
}
.unusual-studio-page section.logos .client-logos {
  display: flex;
  justify-content: space-around;
}
.unusual-studio-page section.logos .client-logo {
  margin-top: 4em;
  margin-bottom: 2em;
  width: 200px;
  height: 100px;
  color: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  border: 1px solid rgba(255, 255, 255, 0.1);
  text-transform: uppercase;
  flex: 0 0 auto;
}

/* footer */
.unusual-studio-page section.footer {
  padding: 0;
  height: 100vh;
  background: #fff;
  color: #000;
  display: flex;
  justify-content: center;
  align-items: center;
  text-align: center;
}
.unusual-studio-page section.footer .footer-copy .footer-copy-h1 a {
  text-decoration: none;
  color: #000;
}
.unusual-studio-page section.footer .footer-copy .footer-copy-h1 a h1 {
  font-size: 200px;
  font-weight: 400;
  letter-spacing: -5px;
}
.unusual-studio-page section.footer .footer-copy .footer-copy-text {
  margin: 2em 0;
}
.unusual-studio-page section.footer .footer-copy .footer-copy-text p {
  text-transform: uppercase;
  font-weight: 400;
  font-size: 14px;
}
.unusual-studio-page section.footer .footer-copy .footer-copy-text p a {
  text-decoration: none;
  color: #000;
}

/* about */
.unusual-studio-page .about {
  background: #000;
  color: #fff;
  min-height: 100vh;
}
.unusual-studio-page .about section.about-us {
  height: 600px;
}
.unusual-studio-page .about section.about-us .about-us-copy {
  width: 70%;
  margin: 0 auto 2em auto;
  display: flex;
  gap: 12em;
  align-items: flex-start;
}
.unusual-studio-page .about section.about-us .about-us-copy > div {
  flex: 1;
}
.unusual-studio-page .about section.about-us .about-us-copy .about-us-copy-p span {
  display: block;
}
.unusual-studio-page .about section.about-us .about-us-copy .about-us-copy-p span a {
  color: #fff;
}
.unusual-studio-page #about-sticky-wrap {
  position: relative;
  padding: 0;
}
.unusual-studio-page .about-sticky-1 {
  width: 100%;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #fff;
  color: #000;
  padding: 4em 2em 4em 2em;
}
.unusual-studio-page .about-sticky-2 {
  width: 100%;
  height: 100vh;
  position: sticky;
  top: 0;
  background: #000;
  color: #fff;
  padding: 4em 2em 4em 2em;
}
.unusual-studio-page .about-sticky .sticky-content {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  padding: 4em 0 6em 0;
}
.unusual-studio-page .sticky-content h1 {
  font-size: 60px !important;
}
.unusual-studio-page .sticky-content h1.num {
  font-size: 120px !important;
}
.unusual-studio-page .more-clients {
  position: relative;
  background: #aeaeae;
  color: #000;
  padding-top: 8em;
}
.unusual-studio-page .more-clients h1 {
  text-align: center;
}
.unusual-studio-page .more-clients .more-clients-logos {
  width: 80%;
  margin: 4em auto;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
}
.unusual-studio-page .more-clients .more-clients-logos .more-clients-logo {
  width: 30%;
  height: 150px;
  margin: 2em 0em;
  display: flex;
  justify-content: center;
  align-items: center;
}
.unusual-studio-page .office {
  padding-top: 12em;
  position: relative;
  background: #000;
  height: max-content !important;
}
.unusual-studio-page .office .about-us-copy {
  width: 100% !important;
  justify-content: space-between;
}
.unusual-studio-page .office .about-us-copy .about-us-copy-h1 {
  flex: 2 !important;
}
.unusual-studio-page .office .about-us-copy .about-us-copy-p {
  flex: 1 !important;
}
.unusual-studio-page .office h1#office {
  font-size: 120px;
  font-weight: 500;
}
.unusual-studio-page .office .hero-img-container {
  margin: 1em 0;
  width: 100%;
  height: 100vh;
}
.unusual-studio-page .office .hero-img-container img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* careers */
.unusual-studio-page section.careers {
  position: relative;
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
  text-align: center;
  background: #aeaeae;
  color: #000;
}
.unusual-studio-page section.careers .careers-copy {
  width: 75%;
  margin: 10em auto 0 auto;
}
.unusual-studio-page section.careers .careers-copy .careers-copy-h1 {
  margin-top: 2em;
}
.unusual-studio-page section.careers .careers-lottie {
  position: absolute;
  bottom: 5%;
  left: 50%;
  transform: translate(-50%, 0%);
  width: 400px;
  height: 400px;
}

/* contact */
.unusual-studio-page section.contact {
  width: 100%;
  height: 100vh;
  background: #fff;
  display: flex;
  justify-content: center;
  align-items: center;
  color: #000;
}
.unusual-studio-page section.contact .contact-copy {
  width: 30%;
  text-align: center;
}
.unusual-studio-page section.contact .contact-copy p {
  font-weight: 400;
  font-size: 17px;
}
.unusual-studio-page section.contact .contact-copy a {
  text-decoration: none;
  color: #000;
}
.unusual-studio-page section.contact .contact-copy span#copyright {
  font-size: 10px;
}

/* project detail */
.unusual-studio-page .project-wrapper section.project-type .project-type-copy {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  width: 100%;
  height: 400px;
}
.unusual-studio-page .project-wrapper section.project-hero {
  padding: 0;
  width: 100%;
  height: 700px;
}
.unusual-studio-page .project-wrapper section.project-hero .project-hero-img,
.unusual-studio-page .project-wrapper section.project-hero .project-hero-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.unusual-studio-page .project-wrapper section.project-overview .project-overview-copy {
  width: 100%;
  height: 300px;
  display: flex;
}
.unusual-studio-page .project-wrapper section.project-overview .project-overview-copy > div {
  flex: 1;
}
.unusual-studio-page .project-wrapper section.project-img-full {
  width: 100%;
  height: 800px;
}
.unusual-studio-page .project-wrapper section.project-img-full .project-img-full-wrapper,
.unusual-studio-page .project-wrapper section.project-img-full .project-img-full-wrapper img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.unusual-studio-page .project-wrapper section.project-info {
  display: flex;
  gap: 2em;
  padding-top: 0;
}
.unusual-studio-page .project-wrapper section.project-info > div {
  flex: 1;
}
.unusual-studio-page .project-wrapper section.project-info .project-info-img {
  height: 700px;
}
.unusual-studio-page .project-wrapper section.project-info .project-info-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.unusual-studio-page .project-overview-copy-h1 h1 a {
  color: #fff;
}
.unusual-studio-page section.discover {
  padding-top: 0;
}

@media (max-width: 900px) {
  .unusual-studio-page h1 { font-size: 32px; }
  .unusual-studio-page p { font-size: 17px; }
  .unusual-studio-page span { font-size: 11px; }
  .unusual-studio-page section.hero-img .hero-img-copy { flex-direction: column; gap: 2em; }
  .unusual-studio-page section.projects .projects-copy { flex-direction: column; }
  .unusual-studio-page section.projects .projects-copy .projects-copy-h1 { width: 100%; }
  .unusual-studio-page section.projects .projects-copy .projects-copy-ws { display: none; }
  .unusual-studio-page .projects-list { flex-direction: column; }
  .unusual-studio-page .projects-list .project .project-name p,
  .unusual-studio-page .projects-list .project .project-category p { font-size: 12px; }
  .unusual-studio-page section.services { flex-direction: column-reverse; gap: 2em; }
  .unusual-studio-page section.services .services-copy-h1,
  .unusual-studio-page section.services .services-copy-p { width: 100%; }
  .unusual-studio-page section.clients .client-copy { flex-direction: column; }
  .unusual-studio-page section.clients .client-copy .client-copy-p { width: 100%; padding: 0 !important; margin-bottom: 4em !important; }
  .unusual-studio-page section.careers .careers-copy { width: 100% !important; }
  .unusual-studio-page section.contact .contact-copy { width: 100% !important; }
  .unusual-studio-page section.footer .footer-copy .footer-copy-h1 a h1 { font-size: 100px !important; }
  .unusual-studio-page .about section.about-us .about-us-copy { align-items: flex-start; flex-direction: column-reverse; gap: 2em; width: 100%; }
  .unusual-studio-page .sticky-content h1 { font-size: 40px !important; }
  .unusual-studio-page .sticky-content h1.num { font-size: 80px !important; }
  .unusual-studio-page .more-clients .more-clients-logos { flex-direction: column; }
  .unusual-studio-page .more-clients .more-clients-logos .more-clients-logo { width: 100%; }
  .unusual-studio-page .office h1#office { font-size: 50px; }
  .unusual-studio-page .project-wrapper section.project-type .project-type-copy { flex-direction: column; justify-content: flex-end; align-items: flex-start; }
  .unusual-studio-page .project-wrapper section.project-overview .project-overview-copy { flex-direction: column; height: max-content; }
  .unusual-studio-page .project-wrapper section.project-overview .project-overview-copy .project-overview-ws { display: none; }
  .unusual-studio-page .project-wrapper section.project-info { flex-direction: column; }
}
`;
}
