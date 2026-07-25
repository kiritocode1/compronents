export function getScrollAdvanceStyles() {
  return `
@import url("https://fonts.googleapis.com/css2?family=Inter:opsz,wght@14..32,100..900&display=swap");

.sap-root {
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  overflow-x: hidden;
  font-family: "Inter", sans-serif;
  background-color: #e3e3db;
  color: #141414;
  container-type: inline-size;
}
.sap-root::-webkit-scrollbar { display: none; }
.sap-root * { margin: 0; padding: 0; box-sizing: border-box; }
.sap-root img { width: 100%; height: 100%; object-fit: cover; }
.sap-root h1 {
  font-size: 5cqw;
  font-weight: 600;
  letter-spacing: -0.04em;
  line-height: 1;
}
.sap-root p,
.sap-root button {
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  color: #141414;
  background: none;
  border: 0;
  cursor: pointer;
  padding: 0;
}
.sap-project-page { position: relative; width: 100%; }
.sap-project-nav {
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 50cqw;
  display: flex;
  justify-content: space-between;
  gap: 2em;
  padding: 1em;
  opacity: 0;
  z-index: 2;
}
.sap-project-nav .sap-link {
  border-radius: 0.5rem;
  background-color: #c6c6be;
  display: flex;
  align-items: center;
  padding: 0 0.75em;
}
.sap-project-page-scroll-progress {
  position: relative;
  flex: 2;
  height: 30px;
  display: flex;
  justify-content: center;
  align-items: center;
  border-radius: 0.5rem;
  border: 1px solid #c6c6be;
  overflow: hidden;
  background-color: rgba(255, 255, 255, 0.25);
  backdrop-filter: blur(20px);
}
.sap-project-page-scroll-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #c6c6be;
  transform: scaleX(0%);
  transform-origin: center left;
  will-change: transform;
  z-index: 0;
}
.sap-project-page-scroll-progress p { position: relative; z-index: 1; }
.sap-project-hero,
.sap-project-footer {
  position: relative;
  width: 100%;
  height: 100svh;
  display: flex;
  justify-content: center;
  align-items: center;
}
.sap-project-description {
  position: absolute;
  bottom: 10%;
  left: 50%;
  transform: translate(-50%, -50%);
  text-align: center;
  opacity: 0;
}
.sap-project-footer-copy {
  position: absolute;
  top: 35%;
  left: 50%;
  transform: translate(-50%, -50%);
}
.sap-project-images {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 5em;
}
.sap-project-img {
  width: 50%;
  height: 75svh;
  background-color: #95958d;
}
.sap-next-project-progress {
  position: absolute;
  bottom: 25%;
  width: 50%;
  height: 4px;
  background-color: #c6c6be;
}
.sap-next-project-progress-bar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: #000;
  transform: scaleX(0%);
  transform-origin: center left;
  will-change: transform;
}

@container (max-width: 900px) {
  .sap-project-nav { width: 100cqw; }
}
`;
}
