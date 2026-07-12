/**
 * Scoped stylesheet for the Neoteric page port. Every source rule is nested
 * under `.neoteric-page` so the template is self-contained inside the registry
 * preview, and image URLs resolve against the Blob-hosted asset base.
 *
 * BLANK - aryank.space
 */

export function getNeotericPageStyles(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&display=swap");

.neoteric-page {
  --color-text: #000;
  --color-bg: #fff;
  --color-text-secondary: #a1a1a1;
  --color-transition: #000;
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: "PP Neue Montreal", "Inter", system-ui, sans-serif;
}

.neoteric-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.neoteric-page a {
  text-decoration: none;
  color: var(--color-text);
  cursor: pointer;
  font-size: 16px;
}
.neoteric-page p {
  font-size: 16px;
  line-height: 125%;
}
.neoteric-page a:hover {
  text-decoration: none;
}
.neoteric-page a#a-underline {
  text-decoration: underline;
}
.neoteric-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.neoteric-page h1 {
  font-weight: 500;
  font-size: 60px;
}
.neoteric-page h1.section-title {
  font-size: 64px !important;
  margin: 0 !important;
  line-height: 85%;
}
.neoteric-page h2 {
  font-weight: 400;
  font-size: 40px;
}
.neoteric-page h2.section-h2 {
  font-size: 32px !important;
  font-weight: 500;
}
.neoteric-page h3 {
  font-weight: 400;
  font-size: 30px;
}
.neoteric-page .container {
  margin: 0 auto;
  max-width: 1200px;
  padding: 0 20px;
}
.neoteric-page .divider {
  width: 100%;
  height: 1px;
  background: var(--color-text);
  margin: 10px 0 15px 0;
}
.neoteric-page .divider.d-light {
  background: var(--color-bg);
}
.neoteric-page .whitespace-300 {
  width: 100%;
  height: 300px;
}
.neoteric-page .whitespace-100 {
  width: 100%;
  height: 100px;
}

.neoteric-page .slide-in {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background: var(--color-transition);
  transform-origin: left;
  z-index: 200000;
  pointer-events: none;
}
.neoteric-page .slide-out {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 100%;
  background: var(--color-transition);
  transform-origin: right;
  z-index: 200000;
  pointer-events: none;
}

/* navbar */
.neoteric-page .navbar {
  position: relative;
  z-index: 100;
}
.neoteric-page .navbar .container {
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 10px;
}
.neoteric-page .navbar-items {
  display: flex;
  gap: 10px;
}
.neoteric-page .navbar-item {
  padding: 10px;
}
.neoteric-page .navbar-logo {
  font-weight: 500;
}
.neoteric-page .navbar-dark {
  background: var(--color-text);
}
.neoteric-page .navbar-dark * {
  color: var(--color-bg);
}

/* footer */
.neoteric-page .footer .container {
  display: flex;
  justify-content: space-between;
  padding: 10px auto 20px auto;
}
.neoteric-page .footer {
  padding-bottom: 20px;
}
.neoteric-page .footer.footer-dark * {
  color: var(--color-bg);
}
.neoteric-page .footer p {
  line-height: 100%;
}

/* home */
.neoteric-page .hero-img {
  width: 100%;
  height: 700px;
  margin: 20px 0 20px 0;
}
.neoteric-page .hero-copy {
  margin-bottom: 200px;
}
.neoteric-page .hero-copy h1 {
  font-size: 42px;
}
.neoteric-page .hero-copy h1 a {
  text-decoration: underline;
  font-size: 42px;
}
.neoteric-page .hero-copy h1 span {
  margin-left: 200px;
}
.neoteric-page .work-section {
  width: 100%;
}
.neoteric-page .work-section-header {
  width: 100%;
  display: flex;
  margin-bottom: 100px;
}
.neoteric-page .work-section-header > div {
  flex: 1;
}
.neoteric-page .section-header-copy {
  display: flex;
  justify-content: space-between;
}
.neoteric-page .projects {
  width: 100%;
}
.neoteric-page .projects .row {
  width: 100%;
  display: flex;
  gap: 10px;
  margin-bottom: 100px;
}
.neoteric-page .projects .row > div {
  flex: 1;
}
.neoteric-page .projects .row .col {
  display: flex;
  gap: 10px;
}
.neoteric-page .projects .row .project-img {
  height: 400px;
}
.neoteric-page .projects .row .col.sm .project-img {
  height: 200px;
}
.neoteric-page .projects .row .col > div {
  flex: 1;
}
.neoteric-page .project-category {
  color: var(--color-text-secondary);
  margin-top: 1.5px;
}
.neoteric-page .project-title {
  margin-top: 5px;
}
.neoteric-page .feeds {
  display: flex;
  gap: 10px;
  margin-bottom: 100px;
}
.neoteric-page .feeds .row {
  display: flex;
  gap: 10px;
}
.neoteric-page .feeds .row > div {
  flex: 1;
}
.neoteric-page .feed {
  margin-bottom: 20px;
}
.neoteric-page .feed-img {
  height: 400px;
}
.neoteric-page .feed-date {
  font-size: 12.5px;
}
.neoteric-page .feed-name {
  margin: 15px 0;
}
.neoteric-page .feed-name p {
  margin-bottom: 5px;
}
.neoteric-page span.feed-copy {
  color: var(--color-text-secondary);
}

/* work / studio / feed page tops */
.neoteric-page .work-page,
.neoteric-page .studio,
.neoteric-page .sample-project,
.neoteric-page .feed-wrapper {
  margin-top: 50px;
}

/* studio */
.neoteric-page .studio-main-img {
  height: 600px;
}
.neoteric-page .studio-img img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.neoteric-page p.process-header {
  margin-bottom: 5px;
}
.neoteric-page p.process-copy {
  color: var(--color-text-secondary);
}
.neoteric-page .awards {
  width: 100%;
}
.neoteric-page .award {
  border-top: 1px solid rgba(0, 0, 0, 0.25);
  padding: 10px 0;
}
.neoteric-page #award-header {
  border-top: none;
  padding-bottom: 30px;
}
.neoteric-page #award-header h3 {
  font-weight: 500;
}
.neoteric-page .award .container {
  width: 100%;
  display: flex;
}
.neoteric-page .award .container > div:nth-child(1) {
  display: flex;
  flex: 3;
}
.neoteric-page .award .container > div:nth-child(2) {
  display: flex;
  flex: 1;
}
.neoteric-page .award .container > div > div {
  display: flex;
  flex: 1;
}
.neoteric-page .award .container > div > div > div {
  flex: 1;
}
.neoteric-page .award .container > div > div:nth-child(1) {
  flex: 3;
}
.neoteric-page .award .container > div > div:nth-child(2) {
  flex: 1;
}
.neoteric-page .studio-img {
  margin-bottom: 20px;
}
.neoteric-page p.contact-info-sec {
  margin: 5px 0;
  color: var(--color-text-secondary);
}
.neoteric-page .project-names h3 {
  line-height: 125%;
}

/* contact */
.neoteric-page .contact-info {
  width: 100%;
  display: flex;
  gap: 50px;
}
.neoteric-page p.sec-contact {
  color: var(--color-text-secondary);
}
.neoteric-page .contact-info .contact-info-col:nth-child(1) {
  flex: 4;
}
.neoteric-page .contact-info .contact-info-col:nth-child(2) {
  flex: 2;
  display: flex;
  gap: 20px;
}
.neoteric-page .contact-info .contact-info-col:nth-child(2) > div {
  flex: 1;
}
.neoteric-page .team {
  width: 100%;
  display: flex;
  margin: 25px 0 100px 0;
}
.neoteric-page .team > div {
  flex: 1;
}
.neoteric-page .team-col {
  display: flex;
  gap: 25px;
}
.neoteric-page .dev {
  flex: 1;
}
.neoteric-page .dev-img {
  height: 300px;
}
.neoteric-page .dev-name {
  margin: 10px 0 10px 0;
}
.neoteric-page .dev-pos {
  margin-bottom: 10px;
}
.neoteric-page .dev-pos p,
.neoteric-page .dev-contact p {
  color: var(--color-text-secondary);
}

/* thinking */
.neoteric-page .thinking {
  background: var(--color-text);
  padding-top: 50px;
  color: var(--color-bg);
}
.neoteric-page .think {
  width: 100%;
  display: flex;
  margin-bottom: 100px;
  gap: 20px;
}
.neoteric-page .think > div {
  flex: 1;
}
.neoteric-page h1.index-h1 {
  font-weight: 400;
  font-size: 64px;
}
.neoteric-page h2.think-h2 {
  font-size: 40px;
  font-weight: 500;
}
.neoteric-page .think-col:nth-child(2) {
  display: flex;
  justify-content: flex-end;
}
.neoteric-page .think-col:nth-child(1) {
  display: flex;
}
.neoteric-page .think-col:nth-child(1) > div {
  flex: 1;
}

/* sample project */
.neoteric-page .project-head {
  width: 100%;
  display: flex;
  margin-bottom: 75px;
}
.neoteric-page .project-head > div:nth-child(1) {
  flex: 4;
}
.neoteric-page .project-head > div:nth-child(2) {
  flex: 1;
}
.neoteric-page .project-sub-head {
  width: 100%;
  display: flex;
  align-items: flex-end;
}
.neoteric-page .project-sub-head > div:nth-child(1) {
  flex: 4;
}
.neoteric-page .project-sub-head > div:nth-child(2) {
  flex: 1;
}
.neoteric-page p.project-copy-sec {
  color: var(--color-text-secondary);
}
.neoteric-page .project-image {
  margin: 20px 0;
  height: 600px;
}
.neoteric-page .project-grid {
  margin-top: 30px;
  margin-bottom: 100px;
}
.neoteric-page .project-dummy {
  margin-bottom: 100px;
}
.neoteric-page .my-masonry-grid {
  display: flex;
  margin-left: -30px;
  width: auto;
}
.neoteric-page .my-masonry-grid_column {
  padding-left: 30px;
  background-clip: padding-box;
}
.neoteric-page .my-masonry-grid_column > div {
  margin-bottom: 30px;
  height: 300px;
}

@media (max-width: 900px) {
  .neoteric-page .container { width: 100%; }
  .neoteric-page .navbar-items { gap: 0; }
  .neoteric-page .navbar-item { padding: 5px; }
  .neoteric-page .footer .container { flex-direction: column; gap: 10px; }
  .neoteric-page #footer-contact { margin-top: 25px; }
  .neoteric-page .hero-copy h1 span { margin-left: 50px; }
  .neoteric-page .work-section-header { gap: 25px; flex-direction: column; }
  .neoteric-page .section-header-copy { padding: 0 2.5px; }
  .neoteric-page .projects .row { flex-direction: column; gap: 40px; }
  .neoteric-page .projects .row .col { flex-direction: column; gap: 40px; }
  .neoteric-page .feeds { flex-direction: column; }
  .neoteric-page .award { padding: 20px 0; }
  .neoteric-page .award .container { flex-direction: column; }
  .neoteric-page .award-name { margin-top: 10px; color: var(--color-text-secondary); }
  .neoteric-page .award-year { width: 100%; display: flex; align-items: flex-end; }
  .neoteric-page .award .container > div > div { flex-direction: column; }
  .neoteric-page #award-header { display: none; }
  .neoteric-page .award:nth-child(2) { border: none !important; }
  .neoteric-page .contact-info { flex-direction: column; }
  .neoteric-page .team, .neoteric-page .team-col { flex-direction: column; }
  .neoteric-page .think { flex-direction: column-reverse; }
  .neoteric-page .think-col:nth-child(1) { flex-direction: column; gap: 20px; }
  .neoteric-page .think-col:nth-child(2) { justify-content: flex-start; }
  .neoteric-page .project-head { flex-direction: column; gap: 25px; }
  .neoteric-page .project-head > div:nth-child(2) { padding: 5px; }
}
`;
}
