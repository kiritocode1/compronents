import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';
import { Pane } from './vendor/tweakpane.js';

const $ = selector => document.querySelector(selector);
const canvas = $('#volume'), stage = $('#stage'), preview = $('#preview');
const previewContext = preview.getContext('2d');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');
const compact = matchMedia('(max-width: 760px), (max-width: 980px) and (max-height: 500px)');
const params = { source: 'sample', time: 0, playing: false, speed: 1, depth: 3, density: .10, brightness: 1, showFrame: true, quality: compact.matches ? 96 : 160, autoRotate: false };
const events = new AbortController();
let renderer, scene, camera, orbit, mesh, material, wire, texture, data, previewImage;
let duration = 1, width = 1, height = 1, count = 1, frameBytes = 4, selectedFrame = -1;
let animation = 0, lastTick = 0, lastUI = 0, disposed = false, contextLost = false;
let loadController, localFile, activeSource = 'sample', sourceName = '', timelineBinding, ready = false;
let revealTimer = 0, messageTimer = 0, drawRequested = true, loadingVisual = null;
let volumeRevealStarted = 0, volumeReveal = 1;
const VOLUME_REVEAL_MS = 800;
const half = new THREE.Vector3(1.35, .76, params.depth / 2);
const axisPoint = new THREE.Vector3();
const pane = new Pane({ container: $('#tweakpane'), title: 'Video Summagator' });
const sourceFolder = pane.addFolder({ title: 'Video source' });
sourceFolder.addBinding(params, 'source', { label: 'Source', options: { 'Sample · flowers': 'sample', 'Local video': 'local' } }).on('change', event => {
  if (event.value === 'sample') loadVideo('sample');
  else if (localFile) loadVideo('local', localFile);
  else { $('#video-file').click(); params.source = activeSource; pane.refresh(); }
});
sourceFolder.addButton({ title: 'Choose video…' }).on('click', () => $('#video-file').click());
sourceFolder.addBinding(params, 'quality', { label: 'Samples', options: { '96 · fast': 96, '160 · balanced': 160, '240 · detailed': 240 } }).on('change', () => loadVideo(activeSource, activeSource === 'local' ? localFile : null, true));

const playback = pane.addFolder({ title: 'Timeline' });
function bindTimeline() {
  timelineBinding?.dispose();
  timelineBinding = playback.addBinding(params, 'time', { label: 'Time (s)', min: 0, max: duration, step: .01, index: 0 }).on('change', event => {
    finishVolumeReveal();
    if (!event.last || !params.playing) params.playing = false;
    playback.refresh(); requestDraw();
  });
  labelInputs();
}
bindTimeline();
playback.addBinding(params, 'playing', { label: 'Play' }).on('change', () => { finishVolumeReveal(); lastTick = 0; requestDraw(); });
playback.addBinding(params, 'speed', { label: 'Speed', min: .1, max: 2, step: .1 });
playback.addButton({ title: 'Return to start' }).on('click', () => { finishVolumeReveal(); params.time = 0; requestDraw(); pane.refresh(); });

const viewFolder = pane.addFolder({ title: 'Transparent volume' });
viewFolder.addBinding(params, 'depth', { label: 'Time depth', min: .5, max: 4, step: .05 }).on('change', updateShape);
viewFolder.addBinding(params, 'showFrame', { label: 'Frame plane' });
viewFolder.addBinding(params, 'density', { label: 'Density', min: .02, max: 2, step: .02 });
viewFolder.addBinding(params, 'brightness', { label: 'Brightness', min: .5, max: 1.7, step: .05 });
const cameraFolder = pane.addFolder({ title: 'Camera', expanded: false });
cameraFolder.addBinding(params, 'autoRotate', { label: 'Auto rotate' });
cameraFolder.addButton({ title: 'Reset camera' }).on('click', resetCamera);
cameraFolder.addButton({ title: 'Front view' }).on('click', () => { if (!camera) return; camera.position.set(0,0,7); orbit.target.set(0,0,0); orbit.update(); requestDraw(); });
pane.on('change', requestDraw);

function labelInputs() {
  for (const row of document.querySelectorAll('#tweakpane .tp-lblv')) {
    const label = row.querySelector('.tp-lblv_l')?.textContent;
    if (label) for (const input of row.querySelectorAll('input,select')) input.setAttribute('aria-label', label);
  }
}
labelInputs();

function notify(text, persistent = false) {
  clearTimeout(messageTimer);
  $('#message').textContent = text; $('#message').hidden = false;
  if (!persistent) messageTimer = setTimeout(() => { $('#message').hidden = true; }, 7000);
}
function abortError() { return new DOMException('Import cancelled', 'AbortError'); }
function mediaEvent(video, event, signal, action) {
  return new Promise((resolve, reject) => {
    if (signal.aborted) { reject(abortError()); return; }
    const timeout = setTimeout(() => finish(new Error('Video decoding timed out. Try an MP4 (H.264) or WebM file.')), 15000);
    const done = () => finish();
    const failed = () => finish(new Error('This video cannot be decoded. Try an MP4 (H.264) or WebM file.'));
    const aborted = () => finish(abortError());
    function finish(error) {
      clearTimeout(timeout); video.removeEventListener(event, done); video.removeEventListener('error', failed); signal.removeEventListener('abort', aborted);
      error ? reject(error) : resolve();
    }
    video.addEventListener(event, done, { once: true }); video.addEventListener('error', failed, { once: true }); signal.addEventListener('abort', aborted, { once: true });
    try { action?.(); } catch (error) { finish(error); }
  });
}
async function loadVideo(kind, file = null, keepTime = false) {
  loadController?.abort();
  clearLoadingVisual();
  volumeRevealStarted = 0; volumeReveal = 1;
  const controller = new AbortController(); loadController = controller;
  const { signal } = controller;
  const video = document.createElement('video');
  video.preload = 'auto'; video.muted = true; video.playsInline = true;
  const url = kind === 'local' && file ? URL.createObjectURL(file) : './assets/flower.mp4';
  const oldProgress = params.time / duration;
  params.playing = false; pane.refresh();
  if (compact.matches) hidePanel();
  document.body.dataset.loading = 'true';
  stage.setAttribute('aria-busy','true');
  $('#message').hidden = true;
  $('#mobile-play').disabled = $('#mobile-scrub').disabled = true;
  if (wire && !ready) { wire.visible = true; mesh.visible = false; requestDraw(); }
  let lastProgress = 0;
  try {
    await mediaEvent(video, 'loadeddata', signal, () => { video.src = url; video.load(); });
    if (!Number.isFinite(video.duration) || video.duration <= 0 || video.videoWidth <= 0 || video.videoHeight <= 0) throw new Error('This file has no readable video duration or image.');
    const sampleCount = Math.min(params.quality, renderer ? renderer.getContext().getParameter(renderer.getContext().MAX_3D_TEXTURE_SIZE) : 256);
    const ratio = video.videoWidth / video.videoHeight;
    // Fixed tiers, no adaptive resolution: <= 320 px on either image axis and <= 40 MiB per volume.
    const sizeScale = Math.min(1, (compact.matches ? 256 : 320) / Math.max(video.videoWidth,video.videoHeight), Math.sqrt((40*1024*1024)/(sampleCount*4*video.videoWidth*video.videoHeight)));
    const w = Math.max(2,Math.round(video.videoWidth*sizeScale)), h = Math.max(2,Math.round(video.videoHeight*sizeScale));
    const bytes = w*h*4, pixels = new Uint8Array(bytes*sampleCount);
    const scratch = document.createElement('canvas'); scratch.width = w; scratch.height = h;
    const ctx = scratch.getContext('2d', { willReadFrequently: true });
    if (renderer && !contextLost) {
      loadingVisual = { previousHalf: half.clone(), texture: createVolumeTexture(pixels,w,h,sampleCount), progress: 0, target: 0, onSettled: null };
      half.x = ratio >= 1 ? 1.35 : 1.35*ratio;
      half.y = ratio >= 1 ? 1.35/ratio : 1.35;
      material.uniforms.uVideo.value = loadingVisual.texture;
      material.uniforms.uTextureSize.value.set(w,h,sampleCount);
      mesh.visible = false; updateShape();
    }
    const endTime = Math.max(0,video.duration - Math.min(.04,video.duration*.01));
    for (let i=0;i<sampleCount;i++) {
      if (signal.aborted || disposed) throw abortError();
      const target = endTime*i/(sampleCount-1);
      if (Math.abs(video.currentTime-target) > .00001) await mediaEvent(video, 'seeked', signal, () => { video.currentTime = target; });
      ctx.drawImage(video,0,0,w,h);
      pixels.set(ctx.getImageData(0,0,w,h).data,i*bytes);
      if (i===0 || performance.now()-lastProgress >= 100 || i===sampleCount-1) {
        const fraction = (i+1)/sampleCount;
        if (loadingVisual) {
          loadingVisual.target = fraction;
          if (i===0 || reduced.matches) loadingVisual.progress = fraction;
          loadingVisual.texture.needsUpdate = true; mesh.visible = true;
        }
        requestDraw(); lastProgress = performance.now();
      }
    }
    // Finish the visible expansion before changing to the selected-frame view.
    await settleLoadingVisual(signal);
    if (signal.aborted || disposed) throw abortError();
    data = pixels; width = w; height = h; count = sampleCount; frameBytes = bytes; duration = video.duration;
    preview.width = w; preview.height = h; previewImage = previewContext.createImageData(w,h); selectedFrame = -1;
    sourceName = kind === 'local' ? file.name : 'Flowers · CC0 sample'; activeSource = kind; params.source = kind;
    if (kind === 'local') localFile = file;
    params.time = (keepTime ? oldProgress : .42)*duration;
    half.x = ratio >= 1 ? 1.35 : 1.35*ratio;
    half.y = ratio >= 1 ? 1.35/ratio : 1.35;
    installTexture(loadingVisual?.texture); bindTimeline(); updateShape(); pane.refresh();
    $('#source-info').textContent = `${sourceName}\n${duration.toFixed(2)}s · ${video.videoWidth} × ${video.videoHeight}\n${count} samples · ${width} × ${height} per frame · ${(data.byteLength/1048576).toFixed(1)} MiB`;
    $('#source-info').style.whiteSpace = 'pre-line';
    ready = true; document.body.dataset.state = renderer && !contextLost ? 'ready' : 'error';
    $('#mobile-scrub').max = duration;
    $('#mobile-duration').textContent = formatTime(duration);
    clearLoadingVisual(true);
    volumeReveal = reduced.matches ? 1 : 0;
    volumeRevealStarted = reduced.matches ? 0 : performance.now();
    requestDraw(); updatePreview();
  } catch (error) {
    if (error.name !== 'AbortError') {
      console.error(error); notify(error.message, !ready);
      if (!ready) { document.body.dataset.state = 'error'; $('#frame-caption').textContent = 'Choose a readable local video to begin.'; }
    } else if (loadController === controller && !disposed) {
      notify(ready ? 'Import cancelled. Previous video kept.' : 'Import cancelled. Choose a video in Controls.');
      if (!ready) $('#frame-caption').textContent = 'Choose a video in Controls.';
    }
  } finally {
    video.pause(); video.removeAttribute('src'); video.load();
    if (url.startsWith('blob:')) URL.revokeObjectURL(url);
    if (loadController === controller) {
      clearLoadingVisual();
      loadController = null; document.body.dataset.loading = 'false'; stage.setAttribute('aria-busy','false');
      if (ready) params.quality = count;
      params.source = activeSource; pane.refresh(); updateTransport(); requestDraw();
    }
  }
}
function settleLoadingVisual(signal) {
  if (signal.aborted) return Promise.reject(abortError());
  if (!loadingVisual || reduced.matches || document.hidden || contextLost || loadingVisual.progress >= 1) return Promise.resolve();
  const visual = loadingVisual;
  return new Promise((resolve, reject) => {
    const finish = () => {
      visual.onSettled = null;
      signal.removeEventListener('abort', finish);
      document.removeEventListener('visibilitychange', hidden);
      signal.aborted ? reject(abortError()) : resolve();
    };
    const hidden = () => { if (document.hidden) finish(); };
    visual.onSettled = finish;
    signal.addEventListener('abort', finish, { once: true });
    document.addEventListener('visibilitychange', hidden);
    requestDraw();
  });
}
function createVolumeTexture(pixels,w,h,frames) {
  const result = new THREE.Data3DTexture(pixels,w,h,frames);
  result.format = THREE.RGBAFormat; result.type = THREE.UnsignedByteType;
  result.minFilter = result.magFilter = THREE.LinearFilter;
  result.wrapS = result.wrapT = result.wrapR = THREE.ClampToEdgeWrapping;
  result.unpackAlignment = 1; result.generateMipmaps = false;
  // Stored bytes are sRGB. Decode explicitly in the shader; do not ask WebGL for an sRGB 3D internal format.
  result.colorSpace = THREE.NoColorSpace; result.needsUpdate = true;
  return result;
}
function clearLoadingVisual(committed = false) {
  if (!loadingVisual) return;
  if (loadingVisual.texture !== texture) loadingVisual.texture.dispose();
  if (!committed) half.copy(loadingVisual.previousHalf);
  loadingVisual = null;
  material.uniforms.uLoaded.value = 1;
  material.uniforms.uVideo.value = texture;
  material.uniforms.uTextureSize.value.set(width,height,count);
  mesh.visible = Boolean(texture); updateShape();
}
function installTexture(decodedTexture) {
  if (!renderer || !data || contextLost) return;
  const previous = texture;
  texture = decodedTexture || createVolumeTexture(data,width,height,count);
  material.uniforms.uVideo.value = texture;
  material.uniforms.uTextureSize.value.set(width,height,count);
  previous?.dispose();
}
function updateShape() {
  half.z = params.depth/2;
  if (mesh) mesh.scale.copy(half).multiplyScalar(2);
  if (wire) wire.scale.copy(half).multiplyScalar(2);
  requestDraw();
}
function formatTime(value) {
  return `${String(Math.floor(value/60)).padStart(2,'0')}:${(value%60).toFixed(2).padStart(5,'0')}`;
}
function finishVolumeReveal() {
  volumeRevealStarted = 0; volumeReveal = 1;
}
function updateTransport() {
  const play = $('#mobile-play'), scrub = $('#mobile-scrub');
  // Share the shader's eased progress, leaving the selected frame itself fixed.
  const displayedTime = params.time * volumeReveal;
  play.disabled = scrub.disabled = !ready || Boolean(loadController);
  play.setAttribute('aria-label', params.playing ? 'Pause video' : 'Play video');
  play.dataset.playing = String(params.playing);
  scrub.value = displayedTime;
  scrub.style.setProperty('--scrub-progress', `${THREE.MathUtils.clamp(displayedTime/duration,0,1)*100}%`);
  scrub.setAttribute('aria-valuetext', `${displayedTime.toFixed(2)} of ${duration.toFixed(2)} seconds`);
  $('#mobile-time').textContent = formatTime(displayedTime);
}
function updatePreview() {
  updateTransport();
  if (!data) return;
  const index = Math.min(count-1,Math.max(0,Math.round(params.time/duration*(count-1))));
  if (index !== selectedFrame) {
    selectedFrame = index;
    previewImage.data.set(data.subarray(index*frameBytes,(index+1)*frameBytes));
    previewContext.putImageData(previewImage,0,0);
    $('#frame-caption').textContent = `Sample ${String(index+1).padStart(3,'0')} / ${count}`;
  }
  const minutes = Math.floor(params.time/60), seconds = params.time%60;
  $('#timecode').textContent = `${String(minutes).padStart(2,'0')}:${seconds.toFixed(2).padStart(5,'0')}`;
  preview.setAttribute('aria-label', `${sourceName}, sampled frame ${index+1} of ${count}, selected time ${params.time.toFixed(2)} seconds`);
}
function updateLabels() {
  if (!camera) return;
  const rect = stage.getBoundingClientRect();
  for (const [selector,z,label] of [['#time-start',half.z,'0.00s'],['#time-end',-half.z,`${duration.toFixed(2)}s →`]]) {
    axisPoint.set(half.x+.06,-half.y-.10,z).project(camera);
    const element = $(selector); element.textContent = label;
    element.style.left = `${THREE.MathUtils.clamp((axisPoint.x*.5+.5)*rect.width,8,Math.max(8,rect.width-element.offsetWidth-8))}px`;
    element.style.top = `${THREE.MathUtils.clamp((-axisPoint.y*.5+.5)*rect.height,8,Math.max(8,rect.height-element.offsetHeight-8))}px`;
  }
}
function requestDraw() { drawRequested = true; resume(); }
function draw() {
  drawRequested = false;
  updatePreview();
  if (!renderer || (!ready && !loadController) || contextLost) return;
  const u = material.uniforms;
  u.uTime.value = loadingVisual ? 0 : params.time/duration;
  u.uLoaded.value = loadingVisual ? loadingVisual.progress : 1;
  u.uAvailable.value = loadingVisual ? loadingVisual.target : 1;
  u.uReveal.value = volumeReveal;
  u.uFrame.value = params.showFrame && !loadingVisual;
  u.uDensity.value = params.density; u.uBrightness.value = params.brightness;
  camera.updateMatrixWorld();
  for (let i=0;i<4;i++) {
    axisPoint.set(i===0 || i===3 ? -half.x : half.x, i<2 ? -half.y : half.y, half.z*(1-2*u.uTime.value)).project(camera);
    u.uFrameCorners.value[i].set((axisPoint.x*.5+.5)*canvas.clientWidth,(axisPoint.y*.5+.5)*canvas.clientHeight);
  }
  renderer.render(scene,camera); updateLabels(); drawRequested = false;
}
function tick(now) {
  animation = 0;
  if (document.hidden || disposed) return;
  const dt = lastTick ? Math.min((now-lastTick)/1000,.1) : 0; lastTick = now;
  if (loadingVisual && loadingVisual.progress < loadingVisual.target) {
    const visual = loadingVisual;
    visual.progress += (visual.target-visual.progress)*(1-Math.exp(-22*dt));
    if (reduced.matches || visual.target-visual.progress < .0005) visual.progress = visual.target;
    drawRequested = true;
    if (visual.progress === 1) visual.onSettled?.();
  }
  if (volumeRevealStarted) {
    const progress = Math.min((now-volumeRevealStarted)/VOLUME_REVEAL_MS,1);
    volumeReveal = progress*progress*(3-2*progress);
    if (progress >= 1) volumeRevealStarted = 0;
    drawRequested = true;
  }
  if (ready && params.playing) { params.time = (params.time+dt*params.speed)%duration; drawRequested = true; }
  if (orbit) { orbit.autoRotate = params.autoRotate; if (orbit.update(dt)) drawRequested = true; }
  if (drawRequested) draw();
  if (now-lastUI > 100 && params.playing) { timelineBinding.refresh(); lastUI = now; }
  if (params.playing || params.autoRotate || drawRequested || volumeRevealStarted || (loadingVisual && loadingVisual.progress < loadingVisual.target)) {
    if (!animation) animation = requestAnimationFrame(tick);
  } else if (!animation) lastTick = 0;
}
function resume() {
  if (!animation && !disposed && !document.hidden) animation = requestAnimationFrame(tick);
}
function resetCamera() {
  if (!camera) return;
  camera.position.set(4.7,2.8,5.2); camera.zoom = 1; camera.updateProjectionMatrix();
  orbit.target.set(0,0,0); orbit.update(); requestDraw();
}
function resize() {
  if (!renderer || disposed) return;
  const w = stage.clientWidth, h = stage.clientHeight;
  if (!w || !h) return;
  renderer.setPixelRatio(Math.min(devicePixelRatio || 1,1.5,1600/Math.max(w,h)));
  renderer.setSize(w,h,false);
  material.uniforms.uCssViewport.value.set(w,h);
  renderer.getDrawingBufferSize(material.uniforms.uDrawingBufferSize.value);
  // Fit the shorter screen axis with an orthographic frustum; retain user zoom on resize.
  const aspect = w/h, halfHeight = (compact.matches ? 2.4 : 2.75) / Math.min(aspect,1);
  camera.left = -halfHeight*aspect; camera.right = halfHeight*aspect;
  camera.top = halfHeight; camera.bottom = -halfHeight;
  camera.updateProjectionMatrix(); requestDraw();
}
async function initialize() {
  try {
    const response = await fetch('./volume.glsl');
    if (!response.ok) throw new Error('Shader unavailable');
    const fragmentShader = await response.text();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false, powerPreference: 'high-performance' });
    renderer.setClearColor(0x050505,1); renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.NoToneMapping;
    renderer.debug.onShaderError = (gl,program,vs,fs) => { console.error(gl.getProgramInfoLog(program),gl.getShaderInfoLog(vs),gl.getShaderInfoLog(fs)); notify('The volume shader could not compile. The selected frame is available below.', true); document.body.dataset.state = 'error'; };
    scene = new THREE.Scene(); camera = new THREE.OrthographicCamera(-2.75,2.75,2.75,-2.75,.05,80);
    orbit = new OrbitControls(camera,canvas); orbit.enableDamping = false; orbit.enablePan = false; orbit.minZoom = .45; orbit.maxZoom = 2.5; orbit.autoRotateSpeed = .6;
    orbit.addEventListener('change',requestDraw);
    material = new THREE.ShaderMaterial({
      glslVersion: THREE.GLSL3, side: THREE.BackSide, depthWrite: false,
      uniforms: { uVideo: {value:null},uHalf:{value:half},uTextureSize:{value:new THREE.Vector3(1,1,1)},uTime:{value:.42},uLoaded:{value:1},uAvailable:{value:1},uReveal:{value:1},uDensity:{value:params.density},uBrightness:{value:params.brightness},uFrame:{value:params.showFrame},uCssViewport:{value:new THREE.Vector2(1,1)},uDrawingBufferSize:{value:new THREE.Vector2(1,1)},uFrameCorners:{value:Array.from({length:4},()=>new THREE.Vector2())} },
      vertexShader: 'out vec3 vPosition; void main(){ vec4 world = modelMatrix * vec4(position,1.); vPosition = world.xyz; gl_Position = projectionMatrix * viewMatrix * world; }',
      fragmentShader,
    });
    const geometry = new THREE.BoxGeometry(1,1,1);
    mesh = new THREE.Mesh(geometry,material); scene.add(mesh);
    wire = new THREE.LineSegments(new THREE.EdgesGeometry(geometry),new THREE.LineBasicMaterial({color:0xd6d6d1,transparent:true,opacity:.3,depthTest:false}));
    wire.renderOrder = 2; scene.add(wire);
    resetCamera(); updateShape(); resize();
  } catch (error) { console.error(error); renderer?.dispose(); renderer = null; document.body.dataset.state='error'; notify('WebGL 2 is unavailable. You can still import a video and inspect its sampled frames.',true); }
  await loadVideo('sample');
}

$('#video-file').addEventListener('change', event => {
  const file = event.target.files[0];
  if (file) loadVideo('local',file);
  event.target.value = '';
}, {signal:events.signal});
$('#mobile-play').addEventListener('click', () => { finishVolumeReveal(); params.playing = !params.playing; lastTick = 0; pane.refresh(); requestDraw(); }, {signal:events.signal});
$('#mobile-scrub').addEventListener('input', event => { finishVolumeReveal(); params.playing = false; params.time = Number(event.target.value); playback.refresh(); requestDraw(); }, {signal:events.signal});
canvas.addEventListener('keydown', event => {
  if (['ArrowLeft','ArrowRight',' '].includes(event.key)) {
    event.preventDefault();
    finishVolumeReveal();
    if (event.key === ' ') params.playing = !params.playing;
    else { params.playing = false; params.time = THREE.MathUtils.clamp(params.time + (event.key === 'ArrowLeft' ? -1 : 1)*duration/(count-1),0,duration); }
    pane.refresh(); requestDraw();
  } else if (event.key.toLowerCase()==='r') resetCamera();
}, {signal:events.signal});
document.addEventListener('visibilitychange', () => { cancelAnimationFrame(animation); animation=0;lastTick=0; if(!document.hidden) requestDraw(); }, {signal:events.signal});
reduced.addEventListener('change', () => { if(reduced.matches){params.playing=false;params.autoRotate=false;volumeRevealStarted=0;volumeReveal=1;pane.refresh();} requestDraw(); }, {signal:events.signal});
canvas.addEventListener('webglcontextlost', event => { event.preventDefault(); contextLost=true; document.body.dataset.state='error'; notify('Graphics paused. The sampled frame is still available while graphics recover.',true); }, {signal:events.signal});
canvas.addEventListener('webglcontextrestored', () => { contextLost=false; installTexture(); document.body.dataset.state='ready'; $('#message').hidden=true; requestDraw(); }, {signal:events.signal});
const observer = new ResizeObserver(resize); observer.observe(stage);

const corner = $('#panel-reveal');
function cancelReveal(){clearTimeout(revealTimer);corner.classList.remove('is-visible');}
function showPanel(){cancelReveal();$('#controls').hidden=false;corner.hidden=true;corner.setAttribute('aria-expanded','true');$('#mobile-controls').setAttribute('aria-expanded','true');document.body.classList.remove('panel-hidden');document.body.classList.add('panel-open');requestDraw();}
function hidePanel(){cancelReveal();$('#controls').hidden=true;corner.hidden=false;corner.setAttribute('aria-expanded','false');$('#mobile-controls').setAttribute('aria-expanded','false');document.body.classList.add('panel-hidden');document.body.classList.remove('panel-open');requestDraw();}
$('#panel-hide').addEventListener('click',hidePanel,{signal:events.signal});
$('#mobile-controls').addEventListener('click',()=>{if($('#controls').hidden){showPanel();$('#panel-hide').focus();}else hidePanel();},{signal:events.signal});
document.addEventListener('keydown',event=>{if(event.key==='Escape'&&compact.matches&&!$('#controls').hidden){hidePanel();$('#mobile-controls').focus();}},{signal:events.signal});
corner.addEventListener('pointerenter',event=>{if(event.pointerType==='touch')return;cancelReveal();revealTimer=setTimeout(()=>corner.classList.add('is-visible'),2000);},{signal:events.signal});
corner.addEventListener('pointerleave',cancelReveal,{signal:events.signal});
corner.addEventListener('pointercancel',cancelReveal,{signal:events.signal});
corner.addEventListener('click',event=>{if(event.detail>0&&event.pointerType!=='touch'&&!corner.classList.contains('is-visible'))return;showPanel();$('#panel-hide').focus();},{signal:events.signal});
window.addEventListener('blur',cancelReveal,{signal:events.signal});
function adaptLayout(){
  $('#panel-hide').textContent = compact.matches ? 'Done' : 'Hide ↗';
  $('#panel-hide').title = compact.matches ? 'Close controls' : 'Hide controls. Hover at the top-right corner for 2 seconds to reveal.';
  if(compact.matches)hidePanel();else showPanel();
  resize();
}
compact.addEventListener('change',adaptLayout,{signal:events.signal});
adaptLayout();
window.addEventListener('pagehide',event=>{
  cancelAnimationFrame(animation);animation=0;
  if(event.persisted)return;
  disposed=true;loadController?.abort();events.abort();observer.disconnect();cancelReveal();clearTimeout(messageTimer);loadingVisual?.texture.dispose();pane.dispose();orbit?.dispose();texture?.dispose();
  mesh?.geometry.dispose();material?.dispose();wire?.geometry.dispose();wire?.material.dispose();renderer?.dispose();data=null;
});
window.addEventListener('pageshow',requestDraw);
initialize();
