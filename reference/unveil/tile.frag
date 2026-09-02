
  precision mediump float;

  uniform vec2 uMeshSize;
  uniform vec2 uImageSize;

  uniform sampler2D uImageTexture;
  uniform sampler2D uBlurTexture;

  uniform float uSaturation;

  varying vec2 vUv;

  void main() {
    vec2 ratio = vec2(min((uMeshSize.x / uMeshSize.y) / (uImageSize.x / uImageSize.y), 1.0), min((uMeshSize.y / uMeshSize.x) / (uImageSize.y / uImageSize.x), 1.0));
    vec2 uvCover = vec2(vUv.x * ratio.x + (1.0 - ratio.x) * 0.5, vUv.y * ratio.y + (1.0 - ratio.y) * 0.5);
    
    vec4 progress = vec4(1.0, 1.0, 1.0, 1.0);
    
    vec4 blurTexture = texture2D(uBlurTexture, uvCover);
    vec4 imageTexture = texture2D(uImageTexture, uvCover);

    float margin = 0.15;
 
    if (vUv.x < margin) {
      progress.rgb *= smoothstep(0.0, margin, vUv.x);
    }

    if (vUv.x > 1.0 - margin) {
      progress.rgb *= smoothstep(1.0, 1.0 - margin, vUv.x);
    }

    if (vUv.y < margin) {
      progress.rgb *= smoothstep(0.0, margin, vUv.y);
    }

    if (vUv.y > 1.0 - margin) {
      progress.rgb *= smoothstep(1.0, 1.0 - margin, vUv.y);
    }

    blurTexture.a *= 0.75;
    
    vec4 color = mix(imageTexture, blurTexture, 1.0 - progress.r);

    gl_FragColor = color;
  }
