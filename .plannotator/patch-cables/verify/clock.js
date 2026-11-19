// Seeded clock for source vs port captures. performance.now starts at a fixed
// 10000ms on both pages (the shader reads absolute time for grain and ink
// bleed), Math.random is a seeded mulberry32, and rAF callbacks queue until
// __step(n) runs n 60Hz frames. WebGL keeps its drawing buffer so toDataURL
// reads the last frame; that does not change what is drawn.
(() => {
  const realTimeout = window.setTimeout.bind(window);
  let vt = 10000;
  let queue = new Map();
  let nextId = 1e9;
  performance.now = () => vt;
  Date.now = () => 1.7e12 + vt;
  let s = 0x9e3779b9;
  window.__seed = (n) => { s = n >>> 0; };
  Math.random = () => { s |= 0; s = (s + 0x6d2b79f5) | 0; let t = Math.imul(s ^ (s >>> 15), 1 | s); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; };
  window.requestAnimationFrame = (cb) => { const id = nextId++; queue.set(id, cb); return id; };
  window.cancelAnimationFrame = (id) => queue.delete(id);
  window.__step = async (n = 1) => {
    for (let i = 0; i < n; i++) {
      vt += 1000 / 60;
      const cbs = queue; queue = new Map();
      for (const cb of cbs.values()) cb(vt);
      await new Promise((r) => realTimeout(r, 4));
    }
    return queue.size;
  };
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === "webgl" || type === "webgl2") attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
    return get.call(this, type, attrs);
  };
})();
