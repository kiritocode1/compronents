export const matrixShader = {
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    #define Rot(a) mat2(cos(a),-sin(a),sin(a),cos(a))
    #define antialiasing(n) n/min(iResolution.y,iResolution.x)
    #define S(d,b) smoothstep(antialiasing(1.5),-antialiasing(1.5),d - b)
    #define B(p,s) max(abs(p).x-s.x,abs(p).y-s.y)
    #define BASE_FONT_SIZE 0.08

    uniform vec2 iResolution;
    uniform float iTime;
    uniform vec3 uColorBg;
    uniform vec3 uColorFg;
    varying vec2 vUv;

    int cA[15] = int[](1,1,1,0,0,1,1,1,1,1,0,1,1,1,1);
    int cB[15] = int[](1,1,1,1,0,1,1,1,0,1,0,1,1,1,1);
    int cC[15] = int[](1,1,1,1,0,0,1,0,0,1,0,0,1,1,1);
    int cD[15] = int[](1,1,0,1,0,1,1,0,1,1,0,1,1,1,0);
    int cE[15] = int[](1,1,1,1,0,0,1,1,0,1,0,0,1,1,1);
    int cF[15] = int[](1,1,1,1,0,0,1,1,0,1,0,0,1,0,0);
    int cG[15] = int[](1,1,1,1,0,0,1,0,1,1,0,1,1,1,1);
    int cH[15] = int[](1,0,1,1,0,1,1,1,1,1,0,1,1,0,1);
    int cI[15] = int[](0,1,0,0,0,0,0,1,0,0,1,0,0,1,0);
    int cJ[15] = int[](0,1,1,0,0,1,0,0,1,0,0,1,1,1,1);
    int cK[15] = int[](1,0,1,1,0,1,1,1,0,1,0,1,1,0,1);
    int cL[15] = int[](1,0,0,1,0,0,1,0,0,1,0,0,1,1,1);
    int cM[15] = int[](1,0,1,1,1,1,1,0,1,1,0,1,1,0,1);
    int cN[15] = int[](1,1,1,1,0,1,1,0,1,1,0,1,1,0,1);
    int cO[15] = int[](1,1,1,1,0,1,1,0,1,1,0,1,1,1,1);
    int cP[15] = int[](1,1,1,1,0,1,1,1,1,1,0,0,1,0,0);
    int cQ[15] = int[](1,1,1,1,0,1,1,0,1,1,1,1,0,0,1);
    int cR[15] = int[](1,1,1,1,0,1,1,1,0,1,0,1,1,0,1);
    int cS[15] = int[](1,1,1,1,0,0,1,1,1,0,0,1,1,1,1);
    int cT[15] = int[](1,1,1,0,1,0,0,1,0,0,1,0,0,1,0);
    int cU[15] = int[](1,0,1,1,0,1,1,0,1,1,0,1,1,1,1);
    int cV[15] = int[](1,0,1,1,0,1,1,0,1,1,1,0,1,0,0);
    int cW[15] = int[](1,0,1,1,0,1,1,0,1,1,1,1,1,0,1);
    int cX[15] = int[](1,0,1,1,0,1,0,1,0,1,0,1,1,0,1);
    int cY[15] = int[](1,0,1,1,0,1,1,1,1,0,1,0,0,1,0);
    int cZ[15] = int[](1,1,1,0,0,1,0,1,0,1,0,0,1,1,1);
    int c0[15] = int[](1,1,1,1,0,1,1,0,1,1,0,1,1,1,1);
    int c1[15] = int[](0,1,0,0,1,0,0,1,0,0,1,0,0,1,0);
    int c2[15] = int[](1,1,1,0,0,1,1,1,1,1,0,0,1,1,1);
    int c3[15] = int[](1,1,1,0,0,1,1,1,1,0,0,1,1,1,1);
    int c4[15] = int[](1,0,0,1,0,0,1,1,0,1,1,1,0,1,0);
    int c5[15] = int[](1,1,1,1,0,0,1,1,1,0,0,1,1,1,1);
    int c6[15] = int[](1,1,1,1,0,0,1,1,1,1,0,1,1,1,1);
    int c7[15] = int[](1,1,1,0,0,1,0,0,1,0,0,1,0,0,1);
    int c8[15] = int[](1,1,1,1,0,1,1,1,1,1,0,1,1,1,1);
    int c9[15] = int[](1,1,1,1,0,1,1,1,1,0,0,1,1,1,1);

    float smin( float d1, float d2, float k ) {
        float h = clamp( 0.5 + 0.5*(d2-d1)/k, 0.0, 1.0 );
        return mix( d2, d1, h ) - k*h*(1.0-h); 
    }

    float baseFontShape(vec2 p, float i){
        float size = BASE_FONT_SIZE;
        float d = length(p)-(size-(cos(10.*(100.+iTime)*(i+1.0)*.2)*(size*0.5)));
        float d2 = length(p)-size;
        d = min(d,d2);
        return d;
    }

    float chars(vec2 p, int data[15], float n){
        vec2 prevP  = p;
        float size = BASE_FONT_SIZE;
        float d = 10.;
        float k = size+0.05;
        for(int i = 0; i<15; i++){
            p = prevP;
            p.x-=(float(i%3)*(size*2.))-(size*2.);
            p.y+=(float(i/3)*(size*2.))-(size*4.);
            
            if(data[i] == 1){
                float d2 = baseFontShape(p,sin(float(i))*n);
                d = smin(d,d2,k);
            }
        }
        return d;
    }

    float drawFont(vec2 p, int char, float n){
        float d = 10.;
        if(char == 0) {
            d = chars(p,c0,n);
        } else if(char == 1) {
            d = chars(p,c1,n);
        } else if(char == 2) {
            d = chars(p,c2,n);
        } else if(char == 3) {
            d = chars(p,c3,n);
        } else if(char == 4) {
            d = chars(p,c4,n);
        } else if(char == 5) {
            d = chars(p,c5,n);
        } else if(char == 6) {
            d = chars(p,c6,n);
        } else if(char == 7) {
            d = chars(p,c7,n);
        } else if(char == 8) {
            d = chars(p,c8,n);
        } else if(char == 9) {
            d = chars(p,c9,n);
        } else if(char == 10) {
            d = chars(p,cA,n);
        } else if(char == 11) {
            d = chars(p,cB,n);
        } else if(char == 12) {
            d = chars(p,cC,n);
        } else if(char == 13) {
            d = chars(p,cD,n);
        } else if(char == 14) {
            d = chars(p,cE,n);
        } else if(char == 15) {
            d = chars(p,cF,n);
        } else if(char == 16) {
            d = chars(p,cG,n);
        } else if(char == 17) {
            d = chars(p,cH,n);
        } else if(char == 18) {
            d = chars(p,cI,n);
        } else if(char == 19) {
            d = chars(p,cJ,n);
        } else if(char == 20) {
            d = chars(p,cK,n);
        } else if(char == 21) {
            d = chars(p,cL,n);
        } else if(char == 22) {
            d = chars(p,cM,n);
        } else if(char == 23) {
            d = chars(p,cN,n);
        } else if(char == 24) {
            d = chars(p,cO,n);
        } else if(char == 25) {
            d = chars(p,cP,n);
        } else if(char == 26) {
            d = chars(p,cQ,n);
        } else if(char == 27) {
            d = chars(p,cR,n);
        } else if(char == 28) {
            d = chars(p,cS,n);
        } else if(char == 29) {
            d = chars(p,cT,n);
        } else if(char == 30) {
            d = chars(p,cU,n);
        } else if(char == 31) {
            d = chars(p,cV,n);
        } else if(char == 32) {
           d = chars(p,cW,n);
        } else if(char == 33) {
           d = chars(p,cX,n);
        } else if(char == 34) {
           d = chars(p,cY,n);
        } else if(char == 35) {
           d = chars(p,cZ,n);
        }
        
        return d;
    }

    float backOut(float t) {
      float f = 1.0 - t;
      return 1.0 - (pow(f, 3.0) - f * sin(f * 3.1415));
    }

    float cubicInOut(float t) {
      return t < 0.5
        ? 4.0 * t * t * t
        : 0.5 * pow(2.0 * t - 2.0, 3.0) + 1.0;
    }

    float getTime(float t, float duration){
        return clamp(t,0.0,duration)/duration;
    }

    float numberAnim(vec2 p, float speed, float n){
        float morphVal = 0.;
        float frame = mod(iTime*speed,10.0);
        float time = frame;
        
        float duration = 0.7;
        float d = drawFont(p,0,n);
        if(frame>=0. && frame<1.){
            time = getTime(time,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,0,n),drawFont(p,1,n),morphVal);
        } else if(frame>=1. && frame<2.){
            time = getTime(time-1.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,1,n),drawFont(p,2,n),morphVal);
        } else if(frame>=2. && frame<3.){
            time = getTime(time-2.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,2,n),drawFont(p,3,n),morphVal);
        } else if(frame>=3. && frame<4.){
            time = getTime(time-3.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,3,n),drawFont(p,4,n),morphVal);
        } else if(frame>=4. && frame<5.){
            time = getTime(time-4.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,4,n),drawFont(p,5,n),morphVal);
        } else if(frame>=5. && frame<6.){
            time = getTime(time-5.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,5,n),drawFont(p,6,n),morphVal);
        } else if(frame>=6. && frame<7.){
            time = getTime(time-6.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,6,n),drawFont(p,7,n),morphVal);
        } else if(frame>=7. && frame<8.){
            time = getTime(time-7.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,7,n),drawFont(p,8,n),morphVal);
        } else if(frame>=8. && frame<9.){
            time = getTime(time-8.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,8,n),drawFont(p,9,n),morphVal);
        } else if(frame>=9. && frame<10.){
            time = getTime(time-9.,duration);
            morphVal = backOut(time);
            d = mix(drawFont(p,9,n),drawFont(p,0,n),morphVal);
        }

        return d;
    }

    float random (vec2 p) {
        return fract(sin(dot(p.xy, vec2(12.9898,78.233)))* 43758.5453123);
    }

    float dots(vec2 p){
        float size = BASE_FONT_SIZE;
        p = mod(p,size)-(size*0.5);
        float d = length(p)-0.002;
        return d;
    }

    float plus(vec2 p){
        float d = min(B(p,vec2(0.001,0.015)),B(p,vec2(0.015,0.001)));
        return d;
    }

   void main() {
    vec2 fragCoord = vUv * iResolution;
    vec2 p = (fragCoord-0.5*iResolution.xy)/iResolution.y;
    vec2 prevP = p;
    vec3 col = uColorFg;
    
    p = prevP;
    
    p.x+=1.;
    p.y+=1.;
    p*=2.5;
    p.y-=100.+iTime*0.5;
    vec2 gv = fract(p)-0.5;
    vec2 id = floor(p);

    float n = random(id)*35.0;
    int char = int(n);
    
    float d = 10.;
    float colorVariation = random(prevP*(iTime+100.));
    vec3 fontColor = mix(uColorBg * 0.5, uColorBg, colorVariation);
    
    if(char < 15){
        d = numberAnim(gv,float(n*0.3),sin(n));
        col = mix(col,fontColor,S(d,0.));
    } else {
        d = drawFont(gv,char,sin(n));
        col = mix(col,fontColor,S(d,0.));
    }
    col = mix(col,uColorBg * 0.6,S(abs(d)-0.003,0.));
    
    p = prevP; 
    
    gl_FragColor = vec4(col,1.0);
}
  `,
};
