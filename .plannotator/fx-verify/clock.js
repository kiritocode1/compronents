// Virtual clock for source vs port captures. performance.now and Date.now
// hold still and requestAnimationFrame callbacks queue until __step(n) runs
// n 60Hz frames. Each frame is followed by a real 8ms task gap so React can
// commit state between frames, as it does in a live browser (Framer pushes
// animation values through React state). Loading still runs on real time, so both pages are stepped
// from the same state once their media has loaded.
(() => {
  const realNow = performance.now.bind(performance);
  const realTimeout = window.setTimeout.bind(window);
  const epoch = Date.now();
  const t0 = realNow();
  let vt = t0;
  let nextId = 1e9;
  let queue = new Map();
  performance.now = () => vt;
  Date.now = () => epoch + (vt - t0);
  window.requestAnimationFrame = (cb) => { const id = nextId++; queue.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => queue.delete(id);
  window.__frames = 0;
  window.__step = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      vt += 1000 / 60;
      window.__frames++;
      const cbs = queue; queue = new Map();
      for (const cb of cbs.values()) cb(vt);
      await new Promise((r) => realTimeout(r, 8));
    }
    return queue.size;
  };
})();
