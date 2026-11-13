// Init script for side-by-side capture of the source and the port. Runs
// before page code. From the first line on, time is virtual:
//   - performance.now and Date.now hold still (gsap's ticker reads Date.now),
//   - requestAnimationFrame callbacks queue until __step(n) runs n 60Hz frames,
//   - setTimeout >= 2000ms (the 2.5s auto-orbit timer) fires on virtual time.
// Loading (fetch, Draco workers, React commits) still runs on real time, so
// the first stepped frame is the first rendered frame on both pages.
//
// Particles: the 1000 positions come from Math.random. bufferData uploads of a
// 3000-float array spanning [-5, 5] are captured into __pts, and overwritten
// with __ptsInject when a page defines it, so both pages draw the same dust.
(() => {
  const realNow = performance.now.bind(performance);
  const realTimeout = window.setTimeout.bind(window);
  const realClear = window.clearTimeout.bind(window);
  const epoch = Date.now();
  const t0 = realNow();
  let vt = t0;
  let nextId = 1e9;
  let queue = new Map();
  const timers = new Map();

  performance.now = () => vt;
  Date.now = () => epoch + (vt - t0);
  window.requestAnimationFrame = (cb) => {
    const id = nextId++;
    queue.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => queue.delete(id);
  window.setTimeout = (fn, ms, ...rest) => {
    if (!(ms >= 2000)) return realTimeout(fn, ms, ...rest);
    const id = nextId++;
    timers.set(id, { at: vt + ms, fn: () => fn(...rest) });
    return id;
  };
  window.clearTimeout = (id) => {
    if (timers.has(id)) timers.delete(id);
    else realClear(id);
  };

  window.__vt = () => vt - t0;
  window.__step = (n = 1) => {
    for (let i = 0; i < n; i++) {
      vt += 1000 / 60;
      for (const [id, t] of [...timers]) {
        if (t.at <= vt) {
          timers.delete(id);
          t.fn();
        }
      }
      const cbs = queue;
      queue = new Map();
      for (const cb of cbs.values()) cb(vt);
    }
    return queue.size;
  };

  window.__pts = null;
  const hook = (proto) => {
    if (!proto) return;
    const real = proto.bufferData;
    proto.bufferData = function (target, data, ...rest) {
      if (data instanceof Float32Array && data.length === 3000 && !window.__pts) {
        let lo = Infinity;
        let hi = -Infinity;
        for (const v of data) {
          if (v < lo) lo = v;
          if (v > hi) hi = v;
        }
        if (lo >= -5 && hi <= 5) {
          if (window.__ptsInject) data.set(window.__ptsInject);
          window.__pts = Array.from(data);
        }
      }
      return real.call(this, target, data, ...rest);
    };
  };
  hook(window.WebGL2RenderingContext?.prototype);
  hook(window.WebGLRenderingContext?.prototype);
})();
