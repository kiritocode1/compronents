// Run after comparison-setup.js in the same browser document.
// Fixed conditions: 640 x 480 CSS pixels, DPR 2, low quality, 1/60 second steps.
// Capture synchronously after submit. Awaiting the queue before drawImage lets
// the browser present and discard the canvas texture, producing empty captures.
(() => {
  const t = window.wcCompare;
  for (let i = 0; i < 24; i++) {
    for (const engine of [t.source, t.port]) {
      const x = innerWidth * (0.2 + 0.6 * i / 23);
      const y = innerHeight * (0.4 + 0.15 * Math.sin(i / 4));
      if (i === 0) {
        engine.pointer.position = [x, y];
        engine.pointer.previous = [x, y];
        engine.strokes = 1;
      }
      Object.assign(engine.pointer, {target: [x, y], isInside: true, mode: 'paint'});
      engine.onLoopFrame(1 / 60);
    }
  }
  const grab = (engine, canvas) => {
    engine.pointer.mode = null;
    engine.onLoopFrame(1 / 60);
    const copy = document.createElement('canvas');
    copy.width = canvas.width;
    copy.height = canvas.height;
    copy.getContext('2d').drawImage(canvas, 0, 0);
    return copy;
  };
  t.images.source = grab(t.source, t.sourceCanvas);
  t.images.port = grab(t.port, t.portCanvas);
  const pixels = canvas => canvas.getContext('2d').getImageData(0, 0, canvas.width, canvas.height);
  const a = pixels(t.images.source), b = pixels(t.images.port);
  let changed = 0, max = 0, opaque = 0;
  for (let i = 0; i < a.data.length; i += 4) {
    if (a.data[i + 3] === 255) opaque++;
    let bad = false;
    for (let j = 0; j < 4; j++) {
      const difference = Math.abs(a.data[i+j] - b.data[i+j]);
      max = Math.max(max, difference);
      if (difference) bad = true;
    }
    if (bad) changed++;
  }
  t.result = {changed, max, opaque, pixels: a.width * a.height};
  if (opaque !== a.width * a.height) throw Error('Invalid transparent capture');
  if (changed !== 0) throw Error('Pixel fidelity comparison failed');
  return t.result;
})();
