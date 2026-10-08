// GLSL preserved from the pinned source.

export const cardVertexShader = `
precision highp float;
attribute vec2 a_position;
attribute vec2 a_uv;

uniform vec2 u_center;
uniform vec2 u_res;
uniform vec2 u_half;
uniform float u_cameraZ;
uniform float u_sheetD;
uniform float u_sheetT;
uniform float u_sheetC;
uniform float u_sheetV;
uniform float u_door;
uniform float u_hover;
uniform float u_dent;
uniform float u_mobileBulge;

varying vec2 vUv;
varying vec3 vFlat;

const float PI = 3.141592653589793;
const float SHEET_BANK = -0.16;
const float SHEET_DIAG = 0.03;
const float SHEET_REAR_Y = 0.1;
const float SHEET_REAR_Z = 0.2;
const float SHEET_VTWIST = 1.8;
const float SHEET_SHIFT = -0.2;

float shape(float q) {
    float bowl = 1.0 - q * q;
    float ess = sin(PI * q);
    return mix(bowl, ess, u_sheetC) * exp(-q * q);
}

float slope(float q) {
    float g = exp(-q * q);
    float bowl = -2.0 * q * (2.0 - q * q);
    float ess = PI * cos(PI * q) - 2.0 * q * sin(PI * q);
    return mix(bowl, ess, u_sheetC) * g;
}

float dome(vec2 uv) {
    vec2 q = uv * 2.0 - 1.0;
    return (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
}

float ramp(float s) {
    s = clamp(s, -1.0, 1.0);
    return s * (1.5 - 0.5 * s * s);
}

void main() {
    vUv = a_uv;
    vec3 local = vec3(a_position * u_res, 0.0);
    local.z -= u_hover * u_dent * u_res.y * dome(a_uv);
    vec3 w = vec3(u_center + local.xy, local.z);
    vFlat = vec3(u_center + local.xy, 0.0);

    if (u_sheetD > 0.0001) {
        float q = w.x / max(u_half.x, 0.0001) * u_sheetT + SHEET_SHIFT;
        float roll = SHEET_BANK * slope(q) / PI * u_sheetC;
        float qe = w.x / max(u_half.x, 0.0001);
        if (u_sheetV > 0.001) {
            roll += SHEET_VTWIST * u_sheetV * smoothstep(0.3, 0.9, abs(qe)) * sign(qe);
        }
        float sr = sin(roll);
        float cr = cos(roll);
        w.yz = vec2(w.y * cr - w.z * sr, w.y * sr + w.z * cr);
        w.z += -u_sheetD * shape(q);
        w.y += SHEET_DIAG * w.x;
        if (u_sheetV > 0.001) {
            float rear = 1.0 - smoothstep(-1.0, 0.3, qe);
            w.y += SHEET_REAR_Y * u_half.x * u_sheetV * rear;
            w.z += SHEET_REAR_Z * u_half.x * u_sheetV * rear;
        }
        w.z += u_half.x * u_door * ramp(w.x / max(u_half.x, 0.0001));
    }

    if (abs(u_mobileBulge) > 0.0001) {
        float t = clamp(w.y / max(u_half.y, 0.0001), -1.0, 1.0);
        w.z += u_mobileBulge * (1.0 - t * t);
    }

    float perspective = u_cameraZ / max(0.01, u_cameraZ - w.z);
    gl_Position = vec4(
        w.x / u_half.x * perspective,
        w.y / u_half.y * perspective,
        clamp((u_cameraZ - w.z) / 100.0, 0.0, 1.0),
        1.0
    );
}
`;

export const cardFragmentShader = `
#extension GL_OES_standard_derivatives : enable
precision highp float;

uniform sampler2D u_texture;
uniform sampler2D u_labelTexture;
uniform vec2 u_res;
uniform vec2 u_half;
uniform vec3 u_titleColor;
uniform vec4 u_labelRect;
uniform vec4 u_arrowRect;
uniform float u_cameraZ;
uniform float u_sheetD;
uniform float u_sheetT;
uniform float u_sheetC;
uniform float u_hover;
uniform float u_dent;
uniform float u_door;
uniform float u_corner;
uniform float u_scrim;
uniform float u_arrowHover;

varying vec2 vUv;
varying vec3 vFlat;

const float PI = 3.141592653589793;
const float SHEET_BANK = -0.16;
const float SHEET_SHIFT = -0.2;

float shape(float q) {
    float bowl = 1.0 - q * q;
    float ess = sin(PI * q);
    return mix(bowl, ess, u_sheetC) * exp(-q * q);
}

float slope(float q) {
    float g = exp(-q * q);
    float bowl = -2.0 * q * (2.0 - q * q);
    float ess = PI * cos(PI * q) - 2.0 * q * sin(PI * q);
    return mix(bowl, ess, u_sheetC) * g;
}

float dome(vec2 uv) {
    vec2 q = uv * 2.0 - 1.0;
    return (1.0 - q.x * q.x) * (1.0 - q.y * q.y);
}

float rampSlope(float s) {
    s = min(abs(s), 1.0);
    return 1.5 * (1.0 - s * s);
}

float roundedBox(vec2 p, vec2 mid, float radius) {
    vec2 q = abs(p - mid) - (mid - radius);
    return length(max(q, 0.0)) + min(max(q.x, q.y), 0.0) - radius;
}

float segmentDistance(vec2 p, vec2 a, vec2 b) {
    vec2 pa = p - a;
    vec2 ba = b - a;
    float h = clamp(dot(pa, ba) / max(dot(ba, ba), 0.0001), 0.0, 1.0);
    return length(pa - ba * h);
}

float arrowMark(vec2 p, float centerX, float aa) {
    p.x -= centerX;
    float d = segmentDistance(p, vec2(-0.38, 0.0), vec2(0.36, 0.0));
    d = min(d, segmentDistance(p, vec2(0.08, -0.27), vec2(0.36, 0.0)));
    d = min(d, segmentDistance(p, vec2(0.08, 0.27), vec2(0.36, 0.0)));
    return 1.0 - smoothstep(0.055, 0.055 + aa, d);
}

float insideUnit(vec2 uv) {
    return step(0.0, uv.x) * step(0.0, uv.y) * step(uv.x, 1.0) * step(uv.y, 1.0);
}

void main() {
    vec4 tex = texture2D(u_texture, vUv);

    if (u_sheetD > 0.0001) {
        float q = vFlat.x / max(u_half.x, 0.0001) * u_sheetT + SHEET_SHIFT;
        float z = -u_sheetD * shape(q);
        float depth = clamp((u_sheetD - z) / (2.0 * u_sheetD), 0.0, 1.0);
        depth += (u_hover * u_dent * u_res.y * dome(vUv)) / (2.0 * u_sheetD);
        depth = clamp(depth, 0.0, 1.0);
        tex.rgb = mix(tex.rgb, vec3(0.059), 0.8 * pow(depth, 1.0));

        float dzdx = -u_sheetD * slope(q) * u_sheetT / max(u_half.x, 0.0001);
        dzdx += u_door * rampSlope(vFlat.x / max(u_half.x, 0.0001));
        float dzdy = 0.0;
        if (u_hover > 0.0001) {
            vec2 hq = vUv * 2.0 - 1.0;
            float a = u_hover * u_dent;
            dzdx += 4.0 * a * u_res.y * hq.x * (1.0 - hq.y * hq.y) / max(u_res.x, 0.0001);
            dzdy += 4.0 * a * hq.y * (1.0 - hq.x * hq.x);
        }
        vec3 normal = normalize(vec3(-dzdx, -dzdy, 1.0));
        float roll = SHEET_BANK * slope(q) / PI * u_sheetC;
        normal.yz = vec2(normal.y * cos(roll) - normal.z * sin(roll), normal.y * sin(roll) + normal.z * cos(roll));
        vec3 lightDir = normalize(vec3(-0.4, 0.5, 1.0));
        float diffuse = dot(normal, lightDir) * 0.5 + 0.5;
        tex.rgb *= 1.0 - 0.12 * (1.0 - diffuse);
        vec3 point = vFlat + vec3(0.0, 0.0, z - u_hover * u_dent * u_res.y * dome(vUv));
        vec3 viewDir = normalize(vec3(0.0, 0.0, u_cameraZ) - point);
        vec3 halfway = normalize(lightDir + viewDir);
        tex.rgb += pow(max(dot(normal, halfway), 0.0), 48.0) * 0.35;
    }

    if (u_scrim > 0.001) {
        float g = 1.0 - smoothstep(0.0, 0.5, vUv.y);
        tex.rgb = mix(tex.rgb, vec3(0.0), u_scrim * 0.65 * g * g);
    }

    // The title mask and arrow are sampled/generated in the same card UVs as
    // the poster. They therefore inherit every vertex bend, roll and hover
    // deformation instead of floating in a separate DOM plane.
    vec2 labelUv = (vUv - u_labelRect.xy) / max(u_labelRect.zw, vec2(0.0001));
    float labelAlpha = texture2D(u_labelTexture, clamp(labelUv, 0.0, 1.0)).a * insideUnit(labelUv);
    tex.rgb = mix(tex.rgb, u_titleColor, labelAlpha);

    vec2 arrowUv = (vUv - u_arrowRect.xy) / max(u_arrowRect.zw, vec2(0.0001));
    float arrowInside = insideUnit(arrowUv);
    vec2 arrowP = (arrowUv - 0.5) * 2.0;
    float arrowAA = max(fwidth(arrowP.x), fwidth(arrowP.y)) * 1.25;
    float pill = (1.0 - smoothstep(0.92, 0.92 + arrowAA, length(arrowP))) * arrowInside;
    tex.rgb = mix(tex.rgb, vec3(0.0), pill);
    float outgoing = arrowMark(arrowP, u_arrowHover * 2.6, arrowAA);
    float incoming = arrowMark(arrowP, (u_arrowHover - 1.0) * 2.6, arrowAA);
    tex.rgb = mix(tex.rgb, vec3(1.0), max(outgoing, incoming) * pill);

    vec2 size = vec2(u_res.x / max(u_res.y, 0.0001), 1.0);
    vec2 mid = size * 0.5;
    float radius = min(u_corner, min(mid.x, mid.y));
    float d = roundedBox(vUv * size, mid, radius);
    float aa = max(fwidth(d), 0.0008);
    float alpha = 1.0 - smoothstep(-aa, aa, d);
    gl_FragColor = vec4(tex.rgb, alpha);
}
`;

export const gridVertexShader = `
precision highp float;
attribute vec2 a_position;
varying vec2 vUv;
void main() {
    vUv = a_position * 0.5 + 0.5;
    gl_Position = vec4(a_position, 0.999, 1.0);
}
`;

export const gridFragmentShader = `
#extension GL_OES_standard_derivatives : enable
precision highp float;
varying vec2 vUv;
uniform float u_aspect;
uniform float u_horizon;
uniform vec3 u_color;

void main() {
    float y = 1.0 - vUv.y;
    float floorY = (y - u_horizon) / max(0.001, 1.0 - u_horizon);
    if (floorY <= 0.0) discard;

    float spread = max(floorY, 0.002);
    float cell = 0.22;
    float gx = (vUv.x - 0.5) * 4.0 / spread;
    float depth = floorY / max(0.025, 1.0 - floorY) * 0.58;
    float lx = abs(fract(gx / cell + 0.5) - 0.5) * cell;
    float ly = abs(fract(depth / cell + 0.5) - 0.5) * cell;
    float ax = max(fwidth(gx), 0.0005) * 1.1;
    float ay = max(fwidth(depth), 0.0005) * 1.1;
    float lineX = 1.0 - smoothstep(ax, ax * 2.0, lx);
    float lineY = 1.0 - smoothstep(ay, ay * 2.0, ly);
    float fade = smoothstep(0.0, 0.09, floorY) * (1.0 - smoothstep(0.9, 1.0, floorY));
    float side = 1.0 - smoothstep(1.3, 2.2, abs(gx));
    float alpha = max(lineX, lineY) * fade * side * 0.9;
    gl_FragColor = vec4(u_color, alpha);
}
`;
