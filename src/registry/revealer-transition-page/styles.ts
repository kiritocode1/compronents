export function getRevealerTransitionStyles() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&display=swap");

.rvt-root {
  --bg: #fff;
  --fg: #0a0a0a;
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
  color: var(--fg);
  background-color: var(--bg);
  container-type: inline-size;
}
.rvt-root::-webkit-scrollbar { display: none; }
.rvt-root * { margin: 0; padding: 0; box-sizing: border-box; }
.rvt-root img { width: 100%; height: 100%; object-fit: cover; }
.rvt-root h1 {
  font-size: 4.25rem;
  font-weight: 600;
  letter-spacing: -0.1rem;
  line-height: 1;
}
.rvt-root h2 {
  font-size: 2rem;
  font-weight: 700;
  letter-spacing: -0.04rem;
  line-height: 1.125;
  -webkit-font-smoothing: antialiased;
}
.rvt-root p,
.rvt-root button {
  display: block;
  text-decoration: none;
  color: var(--fg);
  font-size: 0.85rem;
  font-weight: 600;
  font-family: inherit;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.rvt-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1em;
  display: flex;
  gap: 1em;
  z-index: 3;
}
.rvt-nav .rvt-col:nth-child(1) { flex: 1; }
.rvt-nav .rvt-col:nth-child(2) {
  flex: 2;
  display: flex;
  justify-content: space-between;
}
.rvt-nav-items { display: flex; gap: 1em; }
.rvt-scroll { position: relative; width: 100%; min-height: 100%; }
.rvt-home {
  width: 100%;
  height: 100svh;
  overflow: hidden;
  background-color: var(--bg);
  position: relative;
}
.rvt-home .rvt-header {
  position: absolute;
  top: 25%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 100%;
}
.rvt-home .rvt-header h1 {
  font-size: 30.5cqw;
  text-align: center;
}
.rvt-home .rvt-hero-img {
  position: absolute;
  left: 50%;
  bottom: 0%;
  transform: translateX(-50%);
  width: 95%;
  height: 50%;
  overflow: hidden;
}
.rvt-work {
  text-align: center;
  padding: 15em 1em;
  display: flex;
  flex-direction: column;
  gap: 2em;
  background-color: var(--bg);
}
.rvt-work .rvt-projects {
  width: 32%;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 4em;
}
.rvt-work .rvt-projects img { aspect-ratio: 4/5; }
.rvt-studio,
.rvt-contact {
  padding: 15em 1em;
  display: flex;
  gap: 1em;
  background-color: var(--bg);
}
.rvt-studio .rvt-col:nth-child(1),
.rvt-contact .rvt-col:nth-child(1) { flex: 1; }
.rvt-studio .rvt-col:nth-child(2),
.rvt-contact .rvt-col:nth-child(2) {
  flex: 2;
  display: flex;
  flex-direction: column;
  gap: 2em;
}
.rvt-studio .rvt-about-img { aspect-ratio: 5/7; }
.rvt-contact {
  position: relative;
  width: 100%;
  min-height: 100%;
}
.rvt-contact .rvt-socials {
  position: absolute;
  bottom: 1.5em;
  display: flex;
  gap: 1em;
}
.rvt-letter,
.rvt-word,
.rvt-line {
  position: relative;
  display: inline-block;
  will-change: transform;
}
.rvt-revealer {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  transform-origin: center top;
  background-color: var(--fg);
  pointer-events: none;
  z-index: 2;
}

::view-transition-group(root) { z-index: auto !important; }
::view-transition-image-pair(root) {
  isolation: isolate;
  will-change: clip-path;
  z-index: 1;
}
::view-transition-new(root) {
  z-index: 10000;
  animation: none !important;
}
::view-transition-old(root) {
  z-index: 1;
  animation: none !important;
}
`;
}
