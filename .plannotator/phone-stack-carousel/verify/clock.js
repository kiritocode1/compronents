// Init script for side-by-side capture. Runs before page code on both the
// source and the port. Until __freeze() the page runs on real time. After it,
// performance.now and requestAnimationFrame follow a manual clock that
// __step(n) advances by n 60Hz frames, and video playback is held.
(() => {
  const realRAF = window.requestAnimationFrame.bind(window);
  const realCancel = window.cancelAnimationFrame.bind(window);
  const realNow = performance.now.bind(performance);
  const realTimeout = window.setTimeout.bind(window);
  const realPlay = HTMLMediaElement.prototype.play;
  let frozen = false;
  let vt = 0;
  let nextId = 1e9;
  let queue = new Map();

  performance.now = () => (frozen ? vt : realNow());
  window.requestAnimationFrame = (cb) => {
    if (!frozen) return realRAF(cb);
    const id = nextId++;
    queue.set(id, cb);
    return id;
  };
  window.cancelAnimationFrame = (id) => {
    if (queue.has(id)) queue.delete(id);
    else realCancel(id);
  };
  // Drop the 3.2s autoplay timer so captures are not interrupted.
  window.setTimeout = (fn, ms, ...rest) =>
    ms >= 3000 ? 0 : realTimeout(fn, ms, ...rest);
  HTMLMediaElement.prototype.play = function (...args) {
    if (frozen) return Promise.resolve();
    return realPlay.apply(this, args);
  };

  window.__freeze = async (videoTime = 1) => {
    frozen = true;
    vt = realNow();
    const vids = [...document.querySelectorAll("video")];
    await Promise.all(
      vids.map(
        (v) =>
          new Promise((res) => {
            v.pause();
            const done = () => res();
            v.addEventListener("seeked", done, { once: true });
            realTimeout(done, 4000);
            v.currentTime = videoTime;
          }),
      ),
    );
    return vids.length;
  };
  window.__step = (n = 1) => {
    for (let i = 0; i < n; i++) {
      vt += 1000 / 60;
      const cbs = queue;
      queue = new Map();
      for (const cb of cbs.values()) cb(vt);
    }
    return queue.size;
  };
})();
