// Logs the Web Audio graph each page builds: every node created, every
// connection, every scheduled parameter change and start/stop, keyed to
// creation order. currentTime follows the virtual clock and the context
// reports "running", so notes are scheduled without a real user gesture.
(() => {
  const log = (window.__alog = []);
  const ids = new WeakMap();
  let n = 0;
  const id = (o) => { if (!ids.has(o)) ids.set(o, `${o.constructor.name}#${n++}`); return ids.get(o); };
  const r = (x) => (typeof x === "number" ? +x.toFixed(6) : x);
  const B = BaseAudioContext.prototype;
  Object.defineProperty(B, "currentTime", { get() { return performance.now() / 1000; } });
  Object.defineProperty(AudioContext.prototype, "state", { get() { return "running"; } });
  AudioContext.prototype.resume = function () { return Promise.resolve(); };
  for (const k of Object.getOwnPropertyNames(B)) {
    if (!k.startsWith("create")) continue;
    const f = B[k];
    B[k] = function (...a) { const o = f.apply(this, a); log.push(`${k}(${a.map(r).join(",")})->${id(o)}`); return o; };
  }
  const con = AudioNode.prototype.connect;
  AudioNode.prototype.connect = function (d, ...a) {
    const tgt = d instanceof AudioParam ? `param:${id(d)}` : d instanceof AudioDestinationNode ? "destination" : id(d);
    log.push(`${id(this)}.connect(${tgt})`); return con.call(this, d, ...a);
  };
  const P = AudioParam.prototype;
  for (const k of ["setValueAtTime", "linearRampToValueAtTime", "exponentialRampToValueAtTime"]) {
    const f = P[k];
    P[k] = function (v, t) { log.push(`${id(this)}.${k}(${r(v)},${r(t)})`); return f.call(this, v, t); };
  }
  const vd = Object.getOwnPropertyDescriptor(P, "value");
  Object.defineProperty(P, "value", { get() { return vd.get.call(this); }, set(v) { log.push(`${id(this)}.value=${r(v)}`); vd.set.call(this, v); } });
  for (const C of [AudioScheduledSourceNode]) for (const k of ["start", "stop"]) {
    const f = C.prototype[k];
    C.prototype[k] = function (t) { log.push(`${id(this)}.${k}(${r(t)})`); return f.call(this, t); };
  }
  // Params get ids on first touch, so name them after their owner node.
  for (const [C, ps] of [[OscillatorNode, ["frequency", "detune"]], [GainNode, ["gain"]], [BiquadFilterNode, ["frequency", "Q"]], [DelayNode, ["delayTime"]], [StereoPannerNode, ["pan"]]])
    for (const p of ps) {
      const d = Object.getOwnPropertyDescriptor(C.prototype, p);
      Object.defineProperty(C.prototype, p, { get() { const v = d.get.call(this); if (!ids.has(v)) ids.set(v, `${id(this)}.${p}`); return v; } });
    }
  const td = Object.getOwnPropertyDescriptor(OscillatorNode.prototype, "type");
  Object.defineProperty(OscillatorNode.prototype, "type", { get() { return td.get.call(this); }, set(v) { log.push(`${id(this)}.type=${v}`); td.set.call(this, v); } });
})();
