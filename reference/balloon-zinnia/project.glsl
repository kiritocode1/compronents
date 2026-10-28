
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