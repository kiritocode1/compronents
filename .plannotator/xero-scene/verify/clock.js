// Init script for side-by-side capture of the source and the port. Runs
// before page code. From the first line on, time is virtual:
//   - performance.now and Date.now hold still (gsap's ticker reads Date.now),
//   - requestAnimationFrame callbacks queue until __step(n) runs n 60Hz frames,
//   - setTimeout >= 2000ms (the 2.5s auto-orbit timer) fires on virtual time.
// Loading (fetch, decoding, React commits) still runs on real time.
//
// Particles: the 1000 positions come from Math.random. bufferData uploads of a
// 3000-float array spanning [-5, 5] are captured into __pts, and overwritten
// with __ptsInject when a page defines it, so both pages draw the same dust.
//
// Uniforms: every float uniform named uTime is uploaded as __uTime (default 0)
// on both pages, so the dust holds the same noise offset whatever each page's
// clock reads. The source's R3F clock starts at canvas creation and the port's
// at its first scene frame, so their real uTime differs by the load time.
// __uniforms keeps the last value of each named float uniform, and __log keeps
// one entry per stepped frame with the largest last-uploaded
// `emissive` and `ambientLightColor` (the neon value and the ambient light)
// and the camera position (from `viewMatrix`) farthest from the origin (the scene camera; the
// cube camera sits at the origin).
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

  window.__uTime = 0;
  window.__uniforms = {};
  window.__log = [];
  // Last uploaded value per uniform location; three skips unchanged uploads.
  const emissive = new Map();
  const ambientColor = new Map();
  const maxOf = (map) => Math.max(0, ...map.values());
  const cameraPositions = new Map();
  const farthest = () =>
    [...cameraPositions.values()].reduce(
      (a, b) => (Math.hypot(...b) > Math.hypot(...a) ? b : a),
      [0, 0, 0],
    );

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
      window.__log.push({
        t: +((vt - t0) / 1000).toFixed(4),
        em: +maxOf(emissive).toFixed(4),
        amb: +maxOf(ambientColor).toFixed(4),
        cam: farthest().map((c) => +c.toFixed(4)),
      });
    }
    return queue.size;
  };

  window.__pts = null;
  const names = new WeakMap();
  const hook = (proto) => {
    if (!proto) return;
    const realBufferData = proto.bufferData;
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
      return realBufferData.call(this, target, data, ...rest);
    };
    const realLocation = proto.getUniformLocation;
    proto.getUniformLocation = function (program, name) {
      const location = realLocation.call(this, program, name);
      if (location) names.set(location, name);
      return location;
    };
    const realUniform1f = proto.uniform1f;
    proto.uniform1f = function (location, v) {
      const name = location && names.get(location);
      if (name === "uTime" && typeof window.__uTime === "number") v = window.__uTime;
      if (name && name.startsWith("u")) window.__uniforms[name] = v;
      return realUniform1f.call(this, location, v);
    };
    const realUniform3fv = proto.uniform3fv;
    proto.uniform3fv = function (location, v, ...rest) {
      const name = location && names.get(location);
      if (name === "emissive") emissive.set(location, v[0]);
      if (name === "ambientLightColor") ambientColor.set(location, v[0]);
      if (name === "cameraPosition") cameraPositions.set(location, [v[0], v[1], v[2]]);
      return realUniform3fv.call(this, location, v, ...rest);
    };
    const realMatrix4fv = proto.uniformMatrix4fv;
    proto.uniformMatrix4fv = function (location, transpose, m, ...rest) {
      if (location && names.get(location) === "viewMatrix" && m.length >= 16) {
        // Camera position from a view matrix: -(R^T t), R and t column-major.
        const t = [m[12], m[13], m[14]];
        const p = [0, 1, 2].map(
          (i) => -(m[4 * i] * t[0] + m[4 * i + 1] * t[1] + m[4 * i + 2] * t[2]),
        );
        cameraPositions.set(location, p);
      }
      return realMatrix4fv.call(this, location, transpose, m, ...rest);
    };
    const realUniform3f = proto.uniform3f;
    proto.uniform3f = function (location, x, y, z) {
      const name = location && names.get(location);
      if (name === "emissive") emissive.set(location, x);
      if (name === "ambientLightColor") ambientColor.set(location, x);
      if (name === "cameraPosition") cameraPositions.set(location, [x, y, z]);
      return realUniform3f.call(this, location, x, y, z);
    };
  };
  hook(window.WebGL2RenderingContext?.prototype);
  hook(window.WebGLRenderingContext?.prototype);
})();
