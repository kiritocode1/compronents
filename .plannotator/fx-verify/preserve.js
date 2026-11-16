// Keep WebGL frames readable after compositing so toDataURL returns the last
// drawn frame. Applied to the source and the port alike; it does not change
// what is drawn.
(() => {
  const get = HTMLCanvasElement.prototype.getContext;
  HTMLCanvasElement.prototype.getContext = function (type, attrs) {
    if (type === "webgl" || type === "webgl2")
      attrs = { ...(attrs || {}), preserveDrawingBuffer: true };
    return get.call(this, type, attrs);
  };
})();
