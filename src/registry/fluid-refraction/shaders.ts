// GLSL preserved from the pinned source.

export const fluidVertexShader = `
            precision highp float;
            precision mediump sampler2D;
            attribute vec2 aPosition;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform vec2 texelSize;
            void main () {
                vUv = aPosition * 0.5 + 0.5;
                vL = vUv - vec2(texelSize.x, 0.0);
                vR = vUv + vec2(texelSize.x, 0.0);
                vT = vUv + vec2(0.0, texelSize.y);
                vB = vUv - vec2(0.0, texelSize.y);
                gl_Position = vec4(aPosition, 0.0, 1.0);
            }
        `;

export const clearShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTexture;
            uniform float value;
            void main () {
                gl_FragColor = value * texture2D(uTexture, vUv);
            }
        `;

export const displayShader = `
            precision highp float;
            precision mediump sampler2D;

            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;

            uniform sampler2D uTexture;     // fluid density
            uniform sampler2D uImage;       // background media
            
            uniform vec2 uResolution;
            uniform vec2 uImageRes;
            
            uniform float uRefractionAmount;
            uniform float uChromaticAberration;
            uniform float uHighlight;

            // Calculates object-fit: cover coordinates
            vec2 getCoverUv(vec2 uv, vec2 resolution, vec2 texRes) {
                vec2 s = resolution;
                vec2 i = texRes;
                float rs = s.x / s.y;
                float ri = i.x / i.y;
                vec2 newRes = rs < ri ? vec2(i.x * s.y / i.y, s.y) : vec2(s.x, i.y * s.x / i.x);
                vec2 offset = (rs < ri ? vec2((newRes.x - s.x) / 2.0, 0.0) : vec2(0.0, (newRes.y - s.y) / 2.0)) / newRes;
                vec2 scale = s / newRes;
                return uv * scale + offset;
            }

            void main () {
                // Read density neighbors (acts as a height map)
                float L = texture2D(uTexture, vL).r;
                float R = texture2D(uTexture, vR).r;
                float T = texture2D(uTexture, vT).r;
                float B = texture2D(uTexture, vB).r;
                
                // Gradient of the liquid height
                vec2 grad = vec2(R - L, T - B);
                
                // FLIP Y-AXIS: WebGL loads images bottom-to-top
                vec2 imageUv = vec2(vUv.x, 1.0 - vUv.y);
                
                // Match the distortion with the flipped image space
                vec2 distort = vec2(grad.x, -grad.y);
                
                // Calculate individual distortion for RGB channels (chromatic aberration)
                vec2 distortR = imageUv - distort * (uRefractionAmount + uChromaticAberration);
                vec2 distortG = imageUv - distort * uRefractionAmount;
                vec2 distortB = imageUv - distort * (uRefractionAmount - uChromaticAberration);
                
                // Map to cover sizing logic
                vec2 coverR = getCoverUv(distortR, uResolution, max(uImageRes, vec2(1.0)));
                vec2 coverG = getCoverUv(distortG, uResolution, max(uImageRes, vec2(1.0)));
                vec2 coverB = getCoverUv(distortB, uResolution, max(uImageRes, vec2(1.0)));
                
                float r = texture2D(uImage, coverR).r;
                float g = texture2D(uImage, coverG).g;
                float b = texture2D(uImage, coverB).b;
                
                // Generate normal vector for lighting 
                vec3 normal = normalize(vec3(-grad.x, -grad.y, 0.05)); // 0.05 controls the surface flatness
                vec3 lightDir = normalize(vec3(1.0, 1.0, 1.0));
                
                // Specular intensity calculation
                float spec = pow(max(dot(normal, lightDir), 0.0), 30.0) * uHighlight;
                
                // Mask highlight perfectly so it only illuminates when liquid height exists
                float densityMask = texture2D(uTexture, vUv).r;
                float smoothMask = smoothstep(0.0, 0.1, densityMask);
                
                vec3 finalColor = vec3(r, g, b) + (spec * smoothMask);
                gl_FragColor = vec4(finalColor, 1.0);
            }
        `;

export const splatShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            uniform sampler2D uTarget;
            uniform float aspectRatio;
            uniform vec3 color;
            uniform vec2 point;
            uniform float radius;
            void main () {
                vec2 p = vUv - point.xy;
                p.x *= aspectRatio;
                vec3 splat = exp(-dot(p, p) / radius) * color;
                vec3 base = texture2D(uTarget, vUv).xyz;
                gl_FragColor = vec4(base + splat, 1.0);
            }
        `;

export const manualAdvectionShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            vec4 bilerp (in sampler2D sam, in vec2 p) {
                vec4 st;
                st.xy = floor(p - 0.5) + 0.5;
                st.zw = st.xy + 1.0;
                vec4 uv = st * texelSize.xyxy;
                vec4 a = texture2D(sam, uv.xy);
                vec4 b = texture2D(sam, uv.zy);
                vec4 c = texture2D(sam, uv.xw);
                vec4 d = texture2D(sam, uv.zw);
                vec2 f = p - st.xy;
                return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            void main () {
                vec2 coord = gl_FragCoord.xy - dt * texture2D(uVelocity, vUv).xy;
                gl_FragColor = dissipation * bilerp(uSource, coord);
                gl_FragColor.a = 1.0;
            }
        `;

export const advectionShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            uniform sampler2D uVelocity;
            uniform sampler2D uSource;
            uniform vec2 texelSize;
            uniform float dt;
            uniform float dissipation;
            void main () {
                vec2 coord = vUv - dt * texture2D(uVelocity, vUv).xy * texelSize;
                gl_FragColor = dissipation * texture2D(uSource, coord);
                gl_FragColor.a = 1.0;
            }
        `;

export const divergenceShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uVelocity;
            vec2 sampleVelocity (in vec2 uv) {
                vec2 multiplier = vec2(1.0, 1.0);
                if (uv.x < 0.0) { uv.x = 0.0; multiplier.x = -1.0; }
                if (uv.x > 1.0) { uv.x = 1.0; multiplier.x = -1.0; }
                if (uv.y < 0.0) { uv.y = 0.0; multiplier.y = -1.0; }
                if (uv.y > 1.0) { uv.y = 1.0; multiplier.y = -1.0; }
                return multiplier * texture2D(uVelocity, uv).xy;
            }
            void main () {
                float L = sampleVelocity(vL).x;
                float R = sampleVelocity(vR).x;
                float T = sampleVelocity(vT).y;
                float B = sampleVelocity(vB).y;
                float div = 0.5 * (R - L + T - B);
                gl_FragColor = vec4(div, 0.0, 0.0, 1.0);
            }
        `;

export const curlShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uVelocity;
            void main () {
                float L = texture2D(uVelocity, vL).y;
                float R = texture2D(uVelocity, vR).y;
                float T = texture2D(uVelocity, vT).x;
                float B = texture2D(uVelocity, vB).x;
                float vorticity = R - L - T + B;
                gl_FragColor = vec4(vorticity, 0.0, 0.0, 1.0);
            }
        `;

export const vorticityShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uVelocity;
            uniform sampler2D uCurl;
            uniform float curl;
            uniform float dt;
            void main () {
                float T = texture2D(uCurl, vT).x;
                float B = texture2D(uCurl, vB).x;
                float C = texture2D(uCurl, vUv).x;
                vec2 force = vec2(abs(T) - abs(B), 0.0);
                force *= 1.0 / length(force + 0.00001) * curl * C;
                vec2 vel = texture2D(uVelocity, vUv).xy;
                gl_FragColor = vec4(vel + force * dt, 0.0, 1.0);
            }
        `;

export const pressureShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uPressure;
            uniform sampler2D uDivergence;
            vec2 boundary (in vec2 uv) {
                uv = min(max(uv, 0.0), 1.0);
                return uv;
            }
            void main () {
                float L = texture2D(uPressure, boundary(vL)).x;
                float R = texture2D(uPressure, boundary(vR)).x;
                float T = texture2D(uPressure, boundary(vT)).x;
                float B = texture2D(uPressure, boundary(vB)).x;
                float C = texture2D(uPressure, vUv).x;
                float divergence = texture2D(uDivergence, vUv).x;
                float pressure = (L + R + B + T - divergence) * 0.25;
                gl_FragColor = vec4(pressure, 0.0, 0.0, 1.0);
            }
        `;

export const gradientSubtractShader = `
            precision highp float;
            precision mediump sampler2D;
            varying vec2 vUv;
            varying vec2 vL;
            varying vec2 vR;
            varying vec2 vT;
            varying vec2 vB;
            uniform sampler2D uPressure;
            uniform sampler2D uVelocity;
            vec2 boundary (in vec2 uv) {
                uv = min(max(uv, 0.0), 1.0);
                return uv;
            }
            void main () {
                float L = texture2D(uPressure, boundary(vL)).x;
                float R = texture2D(uPressure, boundary(vR)).x;
                float T = texture2D(uPressure, boundary(vT)).x;
                float B = texture2D(uPressure, boundary(vB)).x;
                vec2 velocity = texture2D(uVelocity, vUv).xy;
                velocity.xy -= vec2(R - L, T - B);
                gl_FragColor = vec4(velocity, 0.0, 1.0);
            }
        `;
