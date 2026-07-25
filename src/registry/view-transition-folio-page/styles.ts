export function getViewTransitionFolioStyles() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.vtf-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
  background-color: #000;
  container-type: inline-size;
}
.vtf-root::-webkit-scrollbar { display: none; }
.vtf-root * { margin: 0; padding: 0; box-sizing: border-box; }
.vtf-root img { width: 100%; height: 100%; object-fit: cover; }
.vtf-container {
  width: 100%;
  min-height: 100%;
  background-color: #f1efe7;
}
.vtf-nav {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1.5em;
  display: flex;
  justify-content: space-between;
  align-items: center;
  z-index: 2;
}
.vtf-link {
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.vtf-nav button {
  display: inline-block;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
  font-family: inherit;
  position: relative;
  transform: translateY(16px);
  will-change: transform;
  text-decoration: none;
  color: #242726;
  font-size: 14px;
  font-weight: 600;
}
.vtf-links { display: flex; gap: 1em; }
.vtf-hero { position: relative; width: 100%; min-height: 100%; }
.vtf-hero h1 {
  width: 100%;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-transform: uppercase;
  color: #242726;
  font-size: 20cqw;
  font-weight: bolder;
  display: flex;
  justify-content: center;
  letter-spacing: -0.5rem;
  line-height: 1;
  clip-path: polygon(0 0, 100% 0, 100% 100%, 0% 100%);
}
.vtf-hero h1 .vtf-char {
  position: relative;
  will-change: transform;
}
.vtf-images {
  width: 100%;
  background-color: #f1efe7;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1em;
  padding: 15em 0;
}
.vtf-images img { width: 35%; margin: 0 auto; }
.vtf-info {
  width: 100%;
  min-height: 100%;
  display: flex;
}
.vtf-col { flex: 1; }
.vtf-col:nth-child(2) {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 2em;
}
.vtf-col p {
  font-weight: 600;
  font-size: 2rem;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #242726;
}
.vtf-line { position: relative; will-change: transform; }

::view-transition-old(root),
::view-transition-new(root) {
  animation-duration: 0.5s;
}

@keyframes vtf-move-out {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0.4;
    transform: translateY(-35%);
  }
}

@keyframes vtf-move-in {
  from {
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
  to {
    clip-path: polygon(0% 100%, 100% 100%, 100% 0%, 0% 0%);
  }
}

::view-transition-old(root) {
  animation: 1.5s cubic-bezier(0.87, 0, 0.13, 1) both vtf-move-out;
}

::view-transition-new(root) {
  animation: 1.5s cubic-bezier(0.87, 0, 0.13, 1) both vtf-move-in;
}
`;
}
