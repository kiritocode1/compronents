(() => {
  const frames = new Map();
  let next = 1;
  window.requestAnimationFrame = (callback) => { const id = next++; frames.set(id, callback); return id; };
  window.cancelAnimationFrame = (id) => frames.delete(id);
  let seed = 42;
  Math.random = () => { seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0; return seed / 4294967296; };
  window.__stepFrames = (count) => {
    for (let i = 0; i < count; i++) {
      const pending = [...frames.values()]; frames.clear();
      for (const callback of pending) callback((i + 1) * 1000 / 60);
    }
    return frames.size;
  };
})();
