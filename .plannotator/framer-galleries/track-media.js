(() => {
  window.__galleryImages = [];
  window.__galleryVideos = [];
  const NativeImage = window.Image;
  window.Image = class extends NativeImage {
    constructor(...args) { super(...args); window.__galleryImages.push(this); }
  };
  const create = document.createElement.bind(document);
  document.createElement = function(tag, ...args) {
    const element = create(tag, ...args);
    if (tag.toLowerCase() === 'video') window.__galleryVideos.push(element);
    return element;
  };
})();
