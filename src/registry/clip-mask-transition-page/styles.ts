export function getClipMaskTransitionStyles(assetBase: string) {
  return `
@import url("https://fonts.googleapis.com/css2?family=Instrument+Sans:ital,wght@0,400..700;1,400..700&family=Anton&display=swap");

.cmt-root {
  --bg: #0f0f0f;
  --fg: #f2f0e6;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  background-color: var(--bg);
  font-family: "Instrument Sans", sans-serif;
  container-type: inline-size;
}
.cmt-root * { margin: 0; padding: 0; box-sizing: border-box; }
.cmt-navbar {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 1rem;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  z-index: 2;
}
.cmt-navbar-items {
  display: flex;
  gap: clamp(1rem, 4cqw, 2rem);
}
.cmt-navbar-item { padding: 1.5rem; }
.cmt-navbar-item button {
  background: none;
  border: 0;
  cursor: pointer;
  text-decoration: none;
  color: var(--fg);
  font-family: "Instrument Sans", sans-serif;
  font-size: 1rem;
  font-weight: 500;
  letter-spacing: -2%;
}
.cmt-page { position: relative; width: 100%; height: 100%; }
.cmt-hero {
  position: relative;
  width: 100%;
  height: 100%;
  background-color: var(--bg);
  color: var(--fg);
  display: flex;
  justify-content: flex-start;
  align-items: flex-end;
  overflow: hidden;
  padding: 2.5rem;
}
.cmt-hero.cmt-genesis {
  background: url(${assetBase}/img1.jpg) no-repeat 50% 50%;
  background-size: cover;
}
.cmt-hero.cmt-gateway {
  background: url(${assetBase}/img2.jpg) no-repeat 50% 50%;
  background-size: cover;
}
.cmt-hero.cmt-colony {
  background: url(${assetBase}/img3.jpg) no-repeat 50% 50%;
  background-size: cover;
}
.cmt-hero h1 {
  text-transform: uppercase;
  font-family: "Anton", sans-serif;
  font-size: clamp(5rem, 15cqw, 15rem);
  font-weight: 500;
  letter-spacing: -4%;
  line-height: 1;
}

@container (max-width: 1000px) {
  .cmt-navbar { padding: 2rem; }
  .cmt-navbar-items {
    align-items: flex-end;
    flex-direction: column;
    gap: 0;
  }
  .cmt-navbar-item { padding: 0.25rem; }
}

::view-transition-group(cmt-navbar) {
  animation: none;
  z-index: 100;
}

::view-transition-old(root) {
  animation: 1000ms cubic-bezier(0.75, 0, 0.1, 1) both cmt-page-out;
}

::view-transition-new(root) {
  animation: 1000ms cubic-bezier(0.75, 0, 0.1, 1) both cmt-page-in;
}

@keyframes cmt-page-out {
  from {
    transform: translateY(0%);
    opacity: 1;
  }
  to {
    transform: translateY(-25%);
    opacity: 0.25;
  }
}

@keyframes cmt-page-in {
  from {
    transform: translateY(25%);
    clip-path: polygon(0% 100%, 100% 100%, 100% 100%, 0% 100%);
  }
  to {
    transform: translateY(0%);
    clip-path: polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%);
  }
}
`;
}
