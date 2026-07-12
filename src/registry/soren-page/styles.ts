/**
 * Scoped stylesheet for the Soren page port. Every source rule is nested under
 * `.soren-page` so the template is self-contained inside the registry preview.
 *
 * BLANK - aryank.space
 */

export function getSorenPageStyles(): string {
  return `
@import url("https://fonts.googleapis.com/css2?family=Urbanist:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&family=Inter:wght@400;500;600&display=swap");

.soren-page {
  --dark-bg-color: hsl(0 0% 7.5%);
  --dark-text-color: hsl(0 0% 90%);
  --dark-text-secondary: hsl(0 0% 60%);
  --dark-text-tertiary: hsl(0 0% 40%);
  --dark-btn-bg: hsl(0 0% 12.5%);
  --dark-card-bg: hsl(0 0% 10%);
  --dark-card-border: hsl(0 0% 15%);
  position: relative;
  width: 100%;
  min-height: 100svh;
  overflow-x: clip;
  background-color: var(--dark-bg-color);
  font-family: "Urbanist", Inter, system-ui, Avenir, Helvetica, Arial, sans-serif;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

.soren-page * {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.soren-page img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.soren-page spline-viewer {
  display: block;
  width: 100%;
  height: 100%;
}

.soren-page .container.page-projects,
.soren-page .container.page-post {
  padding: 0.5em;
  width: 50%;
  margin: 5em auto;
}

.soren-page .container {
  padding: 0.5em;
  max-width: none;
  margin: 0;
}

.soren-page h1 {
  color: var(--dark-text-color);
  font-size: 16px;
  font-weight: 500;
  line-height: 20px;
}

.soren-page p {
  text-decoration: none;
  color: var(--dark-text-color);
  font-size: 14px;
  font-weight: 500;
  line-height: 20px;
}

.soren-page a {
  text-decoration: none;
}

.soren-page button {
  width: 100%;
  border-radius: 8px;
  padding: 1em 0;
  margin-top: 0.3em;
  background-color: var(--dark-btn-bg);
  outline: none;
  border: none;
  color: var(--dark-text-color);
  cursor: pointer;
}

/* dock */
.soren-page .dock-container {
  width: max-content;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 0.5em 0.25em;
  display: flex;
  justify-content: center;
  background-color: var(--dark-bg-color);
  border: 1px solid var(--dark-card-border);
  border-radius: 40px;
  transform-origin: center;
  cursor: pointer;
  z-index: 1000000;
}
.soren-page .dock {
  margin: 0 auto;
  display: flex;
  justify-content: space-around;
}
.soren-page .dock-item {
  position: relative;
  width: 40px;
  height: 40px;
  background: var(--dark-btn-bg);
  border: 1px solid var(--dark-card-border);
  border-radius: 30px;
  margin: 0px;
  display: flex;
  justify-content: center;
  align-items: center;
  transform: scale(1);
  transition: 700ms cubic-bezier(0.075, 0.82, 0.165, 1);
  transform-origin: bottom;
}
.soren-page .dock-item-link-wrap {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

/* home */
.soren-page .hero-header {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  z-index: 100000;
}
.soren-page .home-logo {
  position: absolute;
  top: 2em;
  right: 2em;
  z-index: 100000;
}
.soren-page .live-clock {
  position: absolute;
  top: 2em;
  left: 2em;
  z-index: 100000;
}
.soren-page .live-clock p {
  font-family: "JetBrains Mono";
  font-weight: 500;
  font-size: 13px;
  color: var(--dark-text-tertiary);
}

/* work */
.soren-page .page-work {
  width: 100%;
  display: flex;
  gap: 0.5em;
  margin-bottom: 10em;
}
.soren-page .col {
  flex: 1;
  width: 100%;
  height: 100%;
}
.soren-page .work-item {
  position: relative;
  border: 1px solid var(--dark-card-border);
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 0.5em;
  padding: 0.25em;
}
.soren-page .work-item.type-img {
  padding: 0;
}
.soren-page .work-item-img {
  position: relative;
}
.soren-page .work-item-info {
  position: absolute;
  bottom: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  padding: 1em;
}
.soren-page p#work-date {
  color: var(--dark-text-tertiary);
}
.soren-page .work-item-img-wrapper {
  width: 100%;
  height: 100%;
  border-radius: 8px;
  overflow: hidden;
}
.soren-page .work-item-img-wrapper img {
  transform: scale(1.125);
}
.soren-page .work-200 img { height: 200px; }
.soren-page .work-250 img { height: 250px; }
.soren-page .work-300 img { height: 300px; }
.soren-page .work-350 img { height: 350px; }
.soren-page .work-400 img { height: 400px; }
.soren-page .work-450 img { height: 450px; }
.soren-page .work-500 img { height: 500px; }
.soren-page .work-550 img { height: 550px; }

/* projects */
.soren-page .project-item {
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
  padding: 1em;
  border-radius: 10px;
  gap: 0.5em;
  overflow: hidden;
  cursor: pointer;
}
.soren-page .project-item:hover {
  background-color: var(--dark-card-bg);
}
.soren-page .project-title,
.soren-page .project-copy {
  flex-shrink: 0;
}
.soren-page .project-copy p {
  color: var(--dark-text-tertiary);
}
.soren-page .project-divider {
  flex-grow: 1;
  height: 1px;
  background-color: var(--dark-card-border);
  margin-left: 0.5em;
  margin-right: 0.5em;
}
.soren-page .project-year {
  flex-shrink: 0;
}
.soren-page .project-year p {
  color: var(--dark-text-secondary);
}

/* photos */
.soren-page .page-photos {
  width: 100%;
  display: flex;
  gap: 0.5em;
  margin-bottom: 10em;
}
.soren-page .photos-col {
  flex: 1;
}
.soren-page .page-photos img {
  position: relative;
  height: 600px;
  padding-bottom: 0.5em;
}

/* post */
.soren-page .post-header {
  width: 100%;
  display: flex;
  justify-content: space-between;
}
.soren-page .post-link {
  width: 40px;
  height: 40px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 100%;
  background-color: var(--dark-card-bg);
  border: 1px solid var(--dark-card-border);
}
.soren-page .post-info {
  margin-bottom: 2em;
}
.soren-page .post-info p:nth-child(1) {
  margin-bottom: 0.25em;
}
.soren-page .post-info p:nth-child(2) {
  color: var(--dark-text-tertiary);
}
.soren-page .post-content p {
  margin-bottom: 0.75em;
}
.soren-page .post-img {
  margin: 1em 0;
  border-radius: 8px;
  overflow: hidden;
}
.soren-page .white-space {
  width: 100%;
  height: 200px;
}

@media (max-width: 900px) {
  .soren-page .container.page-projects,
  .soren-page .container,
  .soren-page .container.page-post {
    width: 100%;
  }
  .soren-page .dock-item {
    width: 30px;
    height: 30px;
  }
  .soren-page .page-work {
    flex-direction: column;
  }
  .soren-page .project-copy {
    display: none;
  }
  .soren-page .page-photos {
    flex-direction: column;
  }
}
`;
}
