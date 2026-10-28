#version 300 es
precision highp float;
precision highp int;
precision highp sampler2D;
uniform sampler2D uStem;   // per sample: (centre, radius), normal, binormal (camera space)
uniform int uRound;

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
out vec3 vC;
out vec3 vD;
out float vR;
void main() {
    int i = gl_VertexID / uRound;
    int j = gl_VertexID % uRound;
    vec4 cr = texelFetch(uStem, ivec2(0, i), 0);
    vec3 nn = texelFetch(uStem, ivec2(1, i), 0).xyz;
    vec3 bn = texelFetch(uStem, ivec2(2, i), 0).xyz;
    float a = float(j) * 6.2831853 / float(uRound);
    vec3 d = cos(a) * nn + sin(a) * bn;
    vC = cr.xyz;
    vD = d;
    vR = cr.w;
    gl_Position = project(cr.xyz + cr.w * d);
}