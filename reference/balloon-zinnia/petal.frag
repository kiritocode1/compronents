#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uPal;
uniform vec3 uG;        // band axis × bands per unit (camera space)
uniform float uPhase;   // loop position at the bands' origin
uniform vec3 uHead;     // the bands' origin (they breathe about it)
uniform float uGrain;   // grain amplitude
uniform float uGrainPx; // buffer px per grain (one CSS px)
uniform int uSeed;      // new grain each drawn frame
uvec3 pcg3(uvec3 v) {
    v = v * 1664525u + 1013904223u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    v ^= v >> 16u;
    v.x += v.y * v.z; v.y += v.z * v.x; v.z += v.x * v.y;
    return v;
}
in vec3 vN;
flat in vec3 vC;
flat in vec3 vU;
flat in vec3 vV;
flat in vec3 vW;
flat in float vE;
out vec4 outColor;
void main() {
    vec3 n = normalize(vN);
    vec3 P = vC + n.x * vU + (1.0 + vE * n.x) * (n.y * vV + n.z * vW);
    float t = dot(P - uHead, uG) + uPhase;
    float fw = fwidth(t) * 512.0;
    vec3 c = textureLod(uPal, vec2(t, 0.5), log2(max(fw, 1.0))).rgb;
    // film grain, one grain per CSS pixel (triangular, so it never clumps), plus a whisper of
    // dither so the long blends never band
    uvec3 hv = pcg3(uvec3(uvec2(gl_FragCoord.xy / uGrainPx), uint(uSeed)));
    vec3 u = vec3(hv & 0xffffu) / 65535.0;
    float grain = (u.x + u.y - 1.0) * uGrain;
    float h = fract(sin(dot(gl_FragCoord.xy, vec2(12.9898, 78.233))) * 43758.5453);
    outColor = vec4(clamp(c + grain + (h - 0.5) / 255.0, 0.0, 1.0), 1.0);
}