/**
 * Scoped stylesheet for the Velasco Solari page port. Every source rule is
 * nested under `.velasco-solari-page` so the template is self-contained inside
 * the registry preview, and `@font-face`/media URLs resolve against the
 * Blob-hosted asset base.
 *
 * BLANK - aryank.space
 */

export function getVelascoSolariPageStyles(assetBase: string): string {
  const base = assetBase.replace(/\/$/, "");
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap");

@font-face {
  font-family: "Founders Grotesk";
  src: url("${base}/fonts/TestFoundersGrotesk-Light.otf") format("opentype");
  font-weight: 300;
  font-display: swap;
}
@font-face {
  font-family: "Founders Grotesk";
  src: url("${base}/fonts/TestFoundersGrotesk-Regular.otf") format("opentype");
  font-weight: 400;
  font-display: swap;
}
@font-face {
  font-family: "Founders Grotesk";
  src: url("${base}/fonts/TestFoundersGrotesk-Medium.otf") format("opentype");
  font-weight: 500;
  font-display: swap;
}
@font-face {
  font-family: "Founders Grotesk";
  src: url("${base}/fonts/TestFoundersGrotesk-Semibold.otf") format("opentype");
  font-weight: 600;
  font-display: swap;
}
@font-face {
  font-family: "Founders Grotesk";
  src: url("${base}/fonts/TestFoundersGrotesk-Bold.otf") format("opentype");
  font-weight: 700;
  font-display: swap;
}

.velasco-solari-page {
  --color-bg: #000;
  --color-fg: #fff;
  --colog-fg: #fff;
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--color-bg);
  color: var(--color-fg);
  font-family: "Founders Grotesk", "Inter", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.velasco-solari-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.velasco-solari-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.velasco-solari-page iframe {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: 0;
}

.velasco-solari-page p {
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.125px;
  word-spacing: -0.0175rem;
  text-transform: uppercase;
  line-height: 12.5px;
}

.velasco-solari-page a {
  text-decoration: none;
  color: var(--color-fg);
  font-weight: 600;
  font-size: 15px;
  letter-spacing: -0.125px;
  word-spacing: -0.0175rem;
  text-transform: uppercase;
  line-height: 12.5px;
  cursor: pointer;
}

/* nav */
.velasco-solari-page .nav {
  position: fixed;
  top: 0;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1em;
  z-index: 100000;
}
.velasco-solari-page .nav > div {
  flex: 1;
}
.velasco-solari-page .links {
  display: flex;
  justify-content: flex-end;
  gap: 1em;
}

/* home */
.velasco-solari-page .home-page {
  width: 100%;
  height: 100svh;
  overflow: hidden !important;
}
.velasco-solari-page .hero-video {
  width: 100%;
  height: 100%;
  overflow: hidden;
  transform: scale(1.25);
}
.velasco-solari-page .footer-bottom .footer {
  position: absolute;
  bottom: 0;
}

/* footer */
.velasco-solari-page .footer {
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 1em;
}
.velasco-solari-page .footer-links {
  display: flex;
  gap: 1em;
}

/* work */
.velasco-solari-page .whitespace-300 {
  width: 100%;
  height: 300px;
}
.velasco-solari-page .work {
  position: relative;
  flex: 1;
}
.velasco-solari-page .work-open {
  position: absolute;
  width: 100%;
  height: 100%;
  z-index: 2;
  pointer-events: all !important;
}
.velasco-solari-page .work-open a {
  position: absolute;
  width: 100%;
  height: 100%;
}
.velasco-solari-page .works {
  width: 100%;
  padding: 1em;
}
.velasco-solari-page .row {
  width: 100%;
  display: flex;
  gap: 1em;
  margin: 1em 0;
}
.velasco-solari-page .work-video {
  position: relative;
  width: 100%;
  margin: 0.5em 0;
  height: 250px;
  overflow: hidden;
}
.velasco-solari-page .work-video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  transform: scale(1.5);
  transition: 0.3s all;
}
.velasco-solari-page .work-info {
  display: flex;
  gap: 1em;
}
.velasco-solari-page .work-index p,
.velasco-solari-page .work-name p {
  position: relative;
  left: 0;
  font-size: 12px;
  color: gray;
  transition: all 0.3s;
}
.velasco-solari-page .work:hover .work-index p,
.velasco-solari-page .work:hover .work-name p {
  left: 1em;
  color: #fff;
  transition: 0.3s;
}
.velasco-solari-page .work:hover .work-video-wrapper {
  filter: blur(10px);
  -webkit-filter: blur(10px);
}

/* overview */
.velasco-solari-page .table {
  width: 100%;
  padding: 1em;
}
.velasco-solari-page #table-header p {
  color: var(--color-fg);
}
.velasco-solari-page .table p {
  position: relative;
  left: 0;
  font-size: 12px;
  color: gray;
  transition: all 0.3s;
}
.velasco-solari-page .t-row {
  width: 100%;
  display: flex;
  cursor: pointer;
  transition: all 0.3s;
}
.velasco-solari-page .t-row.not-hovered {
  opacity: 0.5;
  filter: blur(5px);
}
.velasco-solari-page .index {
  flex: 3;
}
.velasco-solari-page .title {
  flex: 6;
}
.velasco-solari-page .category {
  flex: 3;
}
.velasco-solari-page .time {
  flex: 4;
}
.velasco-solari-page .year {
  flex: 1;
  text-align: right;
}
.velasco-solari-page .table .t-row:not(#table-header):hover .index p,
.velasco-solari-page .table .t-row:not(#table-header):hover .title p,
.velasco-solari-page .table .t-row:not(#table-header):hover .category p,
.velasco-solari-page .table .t-row:not(#table-header):hover .time p {
  left: 1em;
  color: #fff;
}

/* mustang */
.velasco-solari-page .mustang-page {
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow: hidden;
}
.velasco-solari-page .mustang-page .container {
  position: relative;
  z-index: 100000;
}
.velasco-solari-page .mustang-video {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100svh;
  z-index: 0;
}
.velasco-solari-page .mustang-video .hero-video {
  width: 100%;
  height: 100%;
}

/* info */
.velasco-solari-page .container {
  padding: 1em;
  max-width: none;
  margin: 0;
}
.velasco-solari-page .container .info-row {
  width: 100%;
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}
.velasco-solari-page .info-col {
  flex: 1;
}
.velasco-solari-page .info-contact {
  margin-bottom: 4em;
}
.velasco-solari-page p.header {
  font-size: 12px;
  color: gray;
  margin-bottom: 0.5em;
}
.velasco-solari-page .info-col.img {
  display: flex;
  justify-content: flex-end;
}
.velasco-solari-page .info-imgs {
  width: 50%;
  height: 200px;
  background: url("${base}/project-images/03.jpg") no-repeat 50% 50%;
  background-size: cover;
}
.velasco-solari-page .info-img-2 {
  width: 100%;
}
.velasco-solari-page .img-2 {
  width: 100%;
  height: 700px;
  background: url("${base}/project-images/02.jpg") no-repeat 50% 50%;
  background-size: cover;
}

/* sample project */
.velasco-solari-page .project-info {
  width: 100%;
  padding: 1em;
  position: fixed;
  top: 25vh;
  display: flex;
  z-index: 100000;
}
.velasco-solari-page .project-info p {
  font-size: 13px;
}
.velasco-solari-page .project-index {
  flex: 1;
}
.velasco-solari-page .project-name {
  flex: 3;
}
.velasco-solari-page .project-duration {
  flex: 3;
}
.velasco-solari-page .project-description {
  flex: 6;
}
.velasco-solari-page .project-year {
  flex: 1;
  text-align: right;
}
.velasco-solari-page .whitespace-35vh {
  width: 100%;
  height: 35vh;
}
.velasco-solari-page .project-preview {
  padding: 0 1em;
  width: 100%;
  display: flex;
  gap: 1em;
}
.velasco-solari-page .project-preview-col {
  flex: 1;
}
.velasco-solari-page .project-preview-col .work-video {
  height: 400px;
}
.velasco-solari-page .sample-images {
  width: 100%;
  padding: 1em;
}
.velasco-solari-page .sample-images .s-row {
  display: flex;
  gap: 1em;
  margin-bottom: 1em;
}
.velasco-solari-page .sample-images .img {
  flex: 1;
  height: 500px;
}
.velasco-solari-page .project-nav {
  width: 100%;
  padding: 1em;
  display: flex;
  justify-content: space-between;
}

@media (max-width: 900px) {
  .velasco-solari-page .hero-video {
    transform: scale(3);
  }
  .velasco-solari-page .row {
    flex-direction: column;
  }
  .velasco-solari-page .index {
    flex: 1;
  }
  .velasco-solari-page .time {
    flex: 2;
  }
  .velasco-solari-page .info-row {
    flex-direction: column-reverse;
  }
  .velasco-solari-page .info-imgs {
    width: 100%;
  }
  .velasco-solari-page .info-row-2 {
    flex-direction: column;
  }
  .velasco-solari-page .project-info {
    flex-direction: column;
  }
  .velasco-solari-page .project-index {
    margin-bottom: 1em;
  }
  .velasco-solari-page .project-year {
    text-align: left;
  }
  .velasco-solari-page .project-description {
    margin-bottom: 0.5em;
  }
  .velasco-solari-page .d-only.project-preview-col {
    display: none;
  }
}
`;
}
