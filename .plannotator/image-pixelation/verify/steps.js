// Init script: holds every 100ms timeout (the step timer on both pages) until
// __next() fires it, so each pixelation step can be read off the canvas.
(() => {
  const real = window.setTimeout.bind(window);
  const held = [];
  window.setTimeout = (fn, ms, ...rest) => {
    if (ms === 100) {
      held.push(() => fn(...rest));
      return 0;
    }
    return real(fn, ms, ...rest);
  };
  window.__next = () => {
    const fns = held.splice(0);
    for (const fn of fns) fn();
    return fns.length;
  };
  window.__held = () => held.length;
  window.__canvas = () => {
    const c = [...document.querySelectorAll("canvas")].find(
      (el) => el.offsetWidth > 300,
    );
    return c
      ? { w: c.width, h: c.height, url: c.toDataURL("image/png") }
      : null;
  };
})();
