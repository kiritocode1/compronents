export function getBlockLogoTransitionStyles() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Barlow+Condensed:ital,wght@0,100;0,200;0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,100;1,200;1,300;1,400;1,500;1,600;1,700;1,800;1,900&family=DM+Mono:ital,wght@0,300;0,400;0,500;1,300;1,400;1,500&display=swap");

.blt-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Barlow Condensed", sans-serif;
  background-color: #e3e4d8;
  container-type: inline-size;
}
.blt-root::-webkit-scrollbar { display: none; }
.blt-root * { margin: 0; padding: 0; box-sizing: border-box; }
.blt-root img { width: 100%; height: 100%; object-fit: cover; }
.blt-root h1 {
  text-transform: uppercase;
  color: #141414;
  font-size: 12cqw;
  font-weight: 800;
  line-height: 1;
}
.blt-root button {
  text-decoration: none;
  text-transform: uppercase;
  color: #141414;
  font-family: "DM Mono", monospace;
  font-size: 0.9rem;
  font-weight: 500;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.blt-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 2rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 1;
}
.blt-nav-logo button {
  font-family: "Barlow Condensed", sans-serif;
  font-size: 1.25rem;
  font-weight: 700;
}
.blt-nav-links { display: flex; gap: 2rem; }
.blt-scroll {
  position: relative;
  width: 100%;
  min-height: 100%;
  display: flex;
  flex-direction: column;
}
.blt-container {
  position: relative;
  width: 100%;
  flex: 1 0 auto;
  background-color: #e3e4d8;
}
.blt-page-header {
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.blt-char { display: inline-block; }
.blt-archive {
  width: 30%;
  margin: 0 auto;
  padding: 15rem 2rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
}
.blt-archive img { aspect-ratio: 5/7; }
.blt-transition-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  display: flex;
  pointer-events: none;
  z-index: 2;
}
.blt-block {
  flex: 1;
  height: 100%;
  background: #222;
  transform: scaleX(0);
  transform-origin: left;
}
.blt-logo-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 3;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #222;
  pointer-events: none;
  opacity: 0;
}
.blt-logo-container {
  width: 200px;
  height: 200px;
  display: flex;
  justify-content: center;
  align-items: center;
}
`;
}
