/**
 * Scoped stylesheet for the Brutalist Portfolio page port. Source rules are
 * nested under `.brutalist-portfolio-page`; fonts and study-icon background
 * images resolve against the Blob asset base.
 *
 * BLANK - aryank.space
 */

export function getBrutalistPortfolioPageStyles(assetBase: string): string {
  const base = assetBase.replace(/\/$/, "");
  return `
@font-face {
  font-family: "PP Mondwest";
  src: url("${base}/fonts/PPMondwest-Regular.otf") format("opentype");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "PP NeueBit";
  src: url("${base}/fonts/PPNeueBit-Bold.otf") format("opentype");
  font-weight: 700;
  font-display: swap;
}

.brutalist-portfolio-page {
  --colors-primary: #340000;
  --colors-background: #e21010;
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  font-family: "PP NeueBit", apple-system, sans-serif;
}

.brutalist-portfolio-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.brutalist-portfolio-page a {
  color: var(--colors-primary);
  text-decoration: none;
}
.brutalist-portfolio-page p {
  font-family: "PP Mondwest";
  font-size: 1.25rem;
}

.brutalist-portfolio-page main {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100vh;
  z-index: 0;
}
.brutalist-portfolio-page .content {
  height: 300px;
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}
.brutalist-portfolio-page .content__img {
  max-width: 250px;
  height: 350px;
  object-fit: cover;
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
  pointer-events: none;
}
@media screen and (min-width: 50em) {
  .brutalist-portfolio-page .content {
    height: 100vh;
    overflow: hidden;
  }
}

.brutalist-portfolio-page .container {
  width: 100%;
  max-width: none;
  margin: 0;
  padding: 0;
  min-height: 100vh;
  background: var(--colors-background);
}
.brutalist-portfolio-page .container#dark {
  background: var(--colors-primary);
}
.brutalist-portfolio-page .gradient {
  position: fixed;
  top: 0;
  width: 100%;
  height: 200px;
  background: linear-gradient(
    0deg,
    rgba(40, 40, 40, 0) 0%,
    var(--colors-background) 100%
  );
  pointer-events: none;
  z-index: 1;
}

/* nav */
.brutalist-portfolio-page nav {
  position: fixed;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  text-transform: uppercase;
  z-index: 1000000 !important;
}
.brutalist-portfolio-page nav#light a {
  color: var(--colors-background);
}
.brutalist-portfolio-page nav .nav-links {
  display: flex;
}
.brutalist-portfolio-page nav .nav-logo .nav-link,
.brutalist-portfolio-page nav .nav-links .nav-link {
  padding: 1rem;
}
.brutalist-portfolio-page nav .nav-logo {
  font-size: 1.5rem;
}

/* header */
.brutalist-portfolio-page header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 2;
}
.brutalist-portfolio-page header #name {
  font-family: "PP NeueBit";
  font-size: 1.575rem;
}

/* footer */
.brutalist-portfolio-page footer {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 2rem;
  z-index: 2;
}
.brutalist-portfolio-page footer#relative {
  padding: 4rem 2rem;
  position: relative;
}
.brutalist-portfolio-page footer .footer-col {
  flex: 1;
  text-align: center;
}
.brutalist-portfolio-page footer .footer-col p {
  font-size: 0.825rem;
}
.brutalist-portfolio-page footer#light p {
  color: var(--colors-background);
}

/* about */
.brutalist-portfolio-page section.about {
  width: 100%;
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 2rem;
  padding-left: 15%;
  padding-right: 15%;
}
.brutalist-portfolio-page section.about .about-col p {
  color: var(--colors-background);
  margin-bottom: 2rem;
}

/* studies */
.brutalist-portfolio-page section.studies {
  width: 100%;
  padding-top: 10rem;
}
.brutalist-portfolio-page section.studies .study {
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-top: 1px solid var(--colors-primary);
}
.brutalist-portfolio-page section.studies .study#final-study {
  border-bottom: 1px solid var(--colors-primary);
}
.brutalist-portfolio-page section.studies .study > div {
  padding: 1rem;
}
.brutalist-portfolio-page section.studies .study .study-category {
  flex: 2;
  text-transform: uppercase;
}
.brutalist-portfolio-page section.studies .study .study-icon {
  flex: 2;
}
.brutalist-portfolio-page section.studies .study .study-icon .study-icon-img {
  width: 100px;
  height: 100px;
  background: var(--colors-primary);
  border-radius: 2rem;
}
.brutalist-portfolio-page section.studies .study .study-name {
  flex: 10;
  font-family: "PP Mondwest";
  font-size: 5rem;
}
.brutalist-portfolio-page section.studies .study .study-year {
  flex: 1;
}

.brutalist-portfolio-page #project-1 { background: url("${base}/images/01.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-2 { background: url("${base}/images/02.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-3 { background: url("${base}/images/03.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-4 { background: url("${base}/images/04.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-5 { background: url("${base}/images/05.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-6 { background: url("${base}/images/06.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-7 { background: url("${base}/images/07.png") no-repeat 50% 50%; background-size: cover; }
.brutalist-portfolio-page #project-8 { background: url("${base}/images/08.png") no-repeat 50% 50%; background-size: cover; }

@media (max-width: 900px) {
  .brutalist-portfolio-page section.about {
    gap: 0;
    flex-direction: column;
    padding-left: 10%;
    padding-right: 10%;
  }
  .brutalist-portfolio-page section.about .about-col p {
    font-size: 1rem;
    margin-bottom: 1rem;
  }
  .brutalist-portfolio-page section.studies .study .study-category { font-size: 0.75rem; }
  .brutalist-portfolio-page section.studies .study .study-year { display: none; }
  .brutalist-portfolio-page section.studies .study .study-icon .study-icon-img {
    width: 40px;
    height: 40px;
    border-radius: 0.5rem;
  }
  .brutalist-portfolio-page section.studies .study .study-name { font-size: 2rem; }
}
`;
}
