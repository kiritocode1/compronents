precision highp float;
precision highp sampler3D;
uniform sampler3D uVideo;
uniform vec3 uHalf;
uniform vec3 uTextureSize;
uniform vec2 uCssViewport;
uniform vec2 uDrawingBufferSize;
uniform vec2 uFrameCorners[4];
uniform float uTime;
uniform float uLoaded;
uniform float uAvailable;
uniform float uReveal;
uniform float uDensity;
uniform float uBrightness;
uniform bool uFrame;
in vec3 vPosition;
out vec4 fragColor;
#define gl_FragColor fragColor

vec3 linearRGB(vec3 c) {
  return mix(c / 12.92, pow((c + .055) / 1.055, vec3(2.4)), step(vec3(.04045), c));
}
vec3 sampleVideo(vec3 p) {
  vec3 uv = clamp(p / (uHalf * 2.) + .5, 0., 1.);
  uv.y = 1. - uv.y;
  // Time starts at +Z and advances toward -Z, matching the moving frame and labels.
  uv.z = 1. - uv.z;
  uv.z = min(uv.z, max((uAvailable*uTextureSize.z-1.)/max(uTextureSize.z-1.,1.),0.));
  // Sample texel centres so first/last time positions are the first/last captured frames.
  uv = (uv * (uTextureSize - 1.) + .5) / uTextureSize;
  return linearRGB(texture(uVideo, uv).rgb) * uBrightness;
}
bool inside(vec3 p) { return all(lessThanEqual(abs(p), uHalf + .0001)); }
float planeHit(vec3 ro, vec3 rd, int axis, float position) {
  float origin = axis == 0 ? ro.x : axis == 1 ? ro.y : ro.z;
  float direction = axis == 0 ? rd.x : axis == 1 ? rd.y : rd.z;
  if (abs(direction) < .00001) return -1.;
  float t = (position - origin) / direction;
  return t > 0. && inside(ro + rd * t) ? t : -1.;
}
float segmentDistance(vec2 p, vec2 a, vec2 b) {
  vec2 edge = b-a;
  float along = clamp(dot(p-a,edge)/max(dot(edge,edge),.000001),0.,1.);
  return length(p-a-along*edge);
}
vec3 outlinedFrame(vec3 p) {
  // Measure against the projected edges in CSS pixels, independent of zoom,
  // viewing angle, device pixel ratio and the drawing-buffer resolution cap.
  vec2 screenPoint = gl_FragCoord.xy * uCssViewport / uDrawingBufferSize;
  float distanceToEdge = min(
    min(segmentDistance(screenPoint,uFrameCorners[0],uFrameCorners[1]),
        segmentDistance(screenPoint,uFrameCorners[1],uFrameCorners[2])),
    min(segmentDistance(screenPoint,uFrameCorners[2],uFrameCorners[3]),
        segmentDistance(screenPoint,uFrameCorners[3],uFrameCorners[0])));
  vec2 cssPerPixel = uCssViewport / uDrawingBufferSize;
  float aa = .5 * max(cssPerPixel.x,cssPerPixel.y);
  // A 1 CSS px inside stroke, with one drawing-buffer pixel of antialiasing.
  float border = 1. - smoothstep(1.-aa,1.+aa,distanceToEdge);
  return mix(sampleVideo(p), vec3(1.), border);
}
void main() {
  // Orthographic rays are parallel. Project each fragment back to the camera plane
  // instead of starting every ray at the camera position as a perspective camera would.
  vec3 rd = -normalize(vec3(viewMatrix[0][2],viewMatrix[1][2],viewMatrix[2][2]));
  vec3 ro = vPosition - rd * dot(vPosition - cameraPosition, rd);
  vec3 safeRd = mix(vec3(-1.),vec3(1.),greaterThanEqual(rd,vec3(0.))) * max(abs(rd),vec3(.000001));
  // While decoding, reveal only the time interval backed by real sampled frames.
  vec3 loadedMin = vec3(-uHalf.xy, mix(uHalf.z,-uHalf.z,uLoaded));
  vec3 t0 = (loadedMin - ro) / safeRd;
  vec3 t1 = (uHalf - ro) / safeRd;
  vec3 nearT = min(t0,t1), farT = max(t0,t1);
  float entry = max(max(nearT.x,nearT.y),nearT.z);
  float exitT = min(min(farT.x,farT.y),farT.z);
  if (exitT < max(entry,0.)) discard;
  entry = max(entry,0.);
  float frameZ = mix(uHalf.z,-uHalf.z,uTime);
  float frameT = planeHit(ro,rd,2,frameZ);
  vec3 color = vec3(0.);
    // Time advances toward -Z. The selected frame and all later frames form an
    // opaque sub-volume. Intersect its boundary exactly, independent of march steps.
    vec3 opaqueMax = vec3(uHalf.xy,frameZ);
    vec3 opaqueT1 = (opaqueMax - ro) / safeRd;
    vec3 opaqueNear = min(t0,opaqueT1), opaqueFar = max(t0,opaqueT1);
    float opaqueEntry = max(entry,max(max(opaqueNear.x,opaqueNear.y),opaqueNear.z));
    float opaqueExit = min(exitT,min(min(opaqueFar.x,opaqueFar.y),opaqueFar.z));
    bool hitsOpaque = opaqueEntry <= opaqueExit;
    float transparentEnd = hitsOpaque ? opaqueEntry : exitT;
    float stepSize = max(transparentEnd - entry,0.) / 160.;
    float alpha = 0.;
    for (int i=0; i<160; i++) {
      if (stepSize <= 0.) break;
      float t = entry + (float(i) + .5) * stepSize;
      vec3 pos = ro + rd * t;
      vec3 col = sampleVideo(pos);
      // Reveal chronological layers from the front toward the selected frame.
      // Each layer softens over 12% of the transition; the selected plane stays put.
      float timeDepth = clamp((uHalf.z-pos.z) / max(2.*uHalf.z*uTime,.00001),0.,1.);
      float revealed = smoothstep(timeDepth*.88,timeDepth*.88+.12,uReveal);
      float extinction = mix(80.,uDensity*5.,revealed);
      float a = 1. - exp(-extinction * stepSize);
      color += (1.-alpha)*a*col;
      alpha += (1.-alpha)*a;
      if (alpha > .995) break;
    }
    if (hitsOpaque) {
      vec3 surface = ro + rd * opaqueEntry;
      bool isCurrentFrame = frameT >= 0. && abs(opaqueEntry-frameT) < .0001;
      vec3 surfaceColor = uFrame && isCurrentFrame ? outlinedFrame(surface) : sampleVideo(surface);
      // Alpha is exactly one here: no later frames show through this surface.
      color += (1.-alpha)*surfaceColor;
    }
  // Match the fully loaded opaque exterior exactly at the start of the reveal.
  if (uReveal <= 0.) color = sampleVideo(ro + rd * entry);
  fragColor = vec4(color,1.);
  #include <colorspace_fragment>
}
