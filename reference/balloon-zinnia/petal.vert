#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uData;   // per ellipsoid: centre + egg taper, then its three scaled axes (camera space)
uniform int uBase;
uniform int uLon;
uniform int uLat;

uniform vec2 uCenter;   // principal point, buffer px (y up)
uniform vec2 uRes;
uniform float uFocal;   // buffer px
uniform vec2 uRoll;     // cos, sin of Angle
uniform vec2 uShift;    // the head's place in the composition, buffer px, before Angle turns it
vec4 project(vec3 P) {
    float dep = -P.z;
    vec2 uv = uFocal * P.xy / dep + uShift;
    vec2 px = uCenter + vec2(uRoll.x * uv.x + uRoll.y * uv.y, -uRoll.y * uv.x + uRoll.x * uv.y);
    return vec4((px / uRes * 2.0 - 1.0) * dep, dep * 1.008368 + -1.004184, dep);
}
out vec3 vN;
flat out vec3 vC;
flat out vec3 vU;
flat out vec3 vV;
flat out vec3 vW;
flat out float vE;
void main() {
    int row = uBase + gl_InstanceID;
    vec4 ce = texelFetch(uData, ivec2(0, row), 0);
    vec3 c = ce.xyz;
    vec3 u = texelFetch(uData, ivec2(1, row), 0).xyz;
    vec3 v = texelFetch(uData, ivec2(2, row), 0).xyz;
    vec3 w = texelFetch(uData, ivec2(3, row), 0).xyz;
    int i = gl_VertexID % uLon;
    int j = gl_VertexID / uLon;
    float th = float(i) * 6.2831853 / float(uLon);
    float ph = float(j) * 3.14159265 / float(uLat);
    vec3 n = vec3(sin(ph) * cos(th), sin(ph) * sin(th), cos(ph));
    vN = n;
    vC = c;
    vU = u;
    vV = v;
    vW = w;
    vE = ce.w;
    // an egg: the cross-section swells toward +u (a petal's tip) and slims toward −u (its hinge)
    gl_Position = project(c + n.x * u + (1.0 + ce.w * n.x) * (n.y * v + n.z * w));
}