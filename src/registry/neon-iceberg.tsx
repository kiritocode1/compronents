"use client";

import { type CSSProperties, useEffect, useRef } from "react";
import * as THREE from "three";

/*
 * Neon Iceberg: an engraved mountain sitting on a gridded block that splits
 * into four printed plates. Port of toolcraft.sh/demos/neon-iceberg without
 * its control panel, timeline and export chrome.
 *
 * One mesh holds a 192 x 192 height field, four perimeter walls and four
 * plate boxes. The vertex shader raises the field into the mountain and cuts
 * the rock/ice seam; the fragment shader lights the rock, engraves it with
 * horizontal hatching, inks the square grid on the walls and the flowing
 * lines on the plates. Shaders, defaults, framing and the orbit drag are the
 * source's own.
 */

/** Every value the source exposes on its panel, at the demo's defaults. */
export interface NeonIcebergSettings {
  height: number;
  width: number;
  sharpness: number;
  asymmetry: number;
  shoulder: number;
  seed: number;
  ridges: number;
  frequency: number;
  erosion: number;
  detail: number;
  depth: number;
  plateGap: number;
  seamLevel: number;
  seamValley: number;
  seamPhase: number;
  seamWarp: number;
  seamTerraces: number;
  seamJagged: number;
  seamScale: number;
  seamVariation: number;
  seamFrequency: number;
  cliff: number;
  frontColumns: number;
  rightColumns: number;
  backColumns: number;
  leftColumns: number;
  gridThickness: number;
  gridStrength: number;
  planeLineThickness: number;
  planeLineDensity: number;
  planeLineDirection: number;
  contrast: number;
  grain: number;
  light: number;
  lightDrama: number;
  engravingStrength: number;
  engravingScale: number;
  engravingThickness: number;
  rockColor: string;
  iceColor: string;
  engravingEnabled: boolean;
}

export interface NeonIcebergPose {
  position: [number, number, number];
  up: [number, number, number];
}

export interface NeonIcebergProps {
  /** Overrides for any shape, pattern or material value. */
  settings?: Partial<NeonIcebergSettings>;
  /** Initial camera pose. Drag on the iceberg to orbit from here. */
  orbit?: NeonIcebergPose;
  /** Loop the plates parting. With reduced motion the plates rest fully parted. */
  playing?: boolean;
  /** Seconds per parting loop. */
  duration?: number;
  /** Colour behind the iceberg. */
  background?: string;
  /** Backing-pixel multiplier on top of devicePixelRatio. The source renders at 2. */
  renderScale?: number;
  className?: string;
  style?: CSSProperties;
}

// The demo's saved state (`tje`), not the panel's slider defaults.
export const NEON_ICEBERG_DEFAULTS: NeonIcebergSettings = {
  height: 1.55,
  width: 2.18,
  sharpness: 1.39,
  asymmetry: 0.15,
  shoulder: 0.63,
  seed: 97,
  ridges: 0.66,
  frequency: 3,
  erosion: 0,
  detail: 0.64,
  depth: 1.36,
  plateGap: 0.11,
  seamLevel: -0.03,
  seamValley: 0.33,
  seamPhase: 81,
  seamWarp: 0.52,
  seamTerraces: 0.6,
  seamJagged: 1,
  seamScale: 1,
  seamVariation: 0.5,
  seamFrequency: 11.1,
  cliff: 0.17,
  frontColumns: 32,
  rightColumns: 16,
  backColumns: 14,
  leftColumns: 10,
  gridThickness: 2.5,
  gridStrength: 0.5,
  planeLineThickness: 90,
  planeLineDensity: 84,
  planeLineDirection: 24,
  contrast: 0,
  grain: 0.65,
  light: 44,
  lightDrama: 0.66,
  engravingStrength: 0.49,
  engravingScale: 0.65,
  engravingThickness: 51,
  rockColor: "#D9DDE0",
  iceColor: "#F0F1F2",
  engravingEnabled: true,
};

const DEFAULT_ORBIT: NeonIcebergPose = {
  position: [5.398182941229226, 2.21363371348611, 4.971865516638815],
  up: [-0.21241246223585997, 0.9573959336839413, -0.19563734830638396],
};

const NUMERIC_KEYS = (
  Object.keys(NEON_ICEBERG_DEFAULTS) as (keyof NeonIcebergSettings)[]
).filter((key) => typeof NEON_ICEBERG_DEFAULTS[key] === "number") as {
  [K in keyof NeonIcebergSettings]: NeonIcebergSettings[K] extends number
    ? K
    : never;
}[keyof NeonIcebergSettings][];

const uniformName = (key: string) => `u${key[0].toUpperCase()}${key.slice(1)}`;

// Framing, verbatim: a 1200 x 1600 artboard at 200 px per world unit, centred
// on a point 0.66 above the origin. The artboard is contained in the box.
const ARTBOARD_WIDTH = 1200;
const ARTBOARD_HEIGHT = 1600;
const PX_PER_UNIT = 200;
const TARGET_Y = 0.66;
const CAMERA_DISTANCE = 12;
const MAX_BACKING_PIXELS = 48e6;

// ---------------------------------------------------------------------------
// Shaders, verbatim.

const CUBE_PATTERN = `
uniform float uFrontColumns, uRightColumns, uBackColumns, uLeftColumns;
uniform float uGridThickness, uGridStrength;
uniform vec3 uViewDirection;

float cubePatternInk(
  vec3 world,
  float region,
  float rockMask,
  float slice,
  float plateGap,
  float plateThickness
) {
  // Ice cutouts also occupy the sloped cap. Evaluate their ink on the virtual
  // cube plane along the orthographic sight ray, so lines continue straight
  // through the join instead of wrapping around the mountain's triangles.
  if(max(abs(uViewDirection.x),abs(uViewDirection.z))<0.00001) return 0.0;
  vec2 travel=vec2(1000000.0);
  if(abs(uViewDirection.x)>0.00001)
    travel.x=(sign(uViewDirection.x)*uWidth*0.5-world.x)/uViewDirection.x;
  if(abs(uViewDirection.z)>0.00001)
    travel.y=(sign(uViewDirection.z)*uWidth*0.5-world.z)/uViewDirection.z;
  vec3 plane=world+uViewDirection*max(0.0,min(travel.x,travel.y));
  // The same planar derivatives keep line weight continuous at the join.
  float footprint=max(length(dFdx(plane)),length(dFdy(plane)));
  if(region>1.5||rockMask>=1.0) return 0.0;
  // A visible cap cutout can belong to a far cube edge. Its nearest physical
  // boundary must face the camera before projecting ink onto the near plane;
  // otherwise the far side's pattern appears painted over the upper slope.
  vec2 boundaryNormal=abs(world.x)>=abs(world.z)
    ?vec2(sign(world.x),0.0):vec2(0.0,sign(world.z));
  if(dot(boundaryNormal,uViewDirection.xz)<=0.00001) return 0.0;
  bool zFace=travel.y<=travel.x;
  float columns=zFace
    ? (uViewDirection.z>=0.0?uFrontColumns:uBackColumns)
    : (uViewDirection.x>=0.0?uRightColumns:uLeftColumns);
  // Numeric entry/import may contain fractions. Tile subdivision is discrete
  // even during a smooth pointer drag, so never render a partial last column.
  columns=clamp(floor(columns+0.5),1.0,32.0);
  float across=zFace?plane.x:plane.z;
  // Both vertical edges land on integer grid lines. The same world spacing
  // vertically keeps tiles square, independently of block width and depth.
  float frequency=columns/uWidth;
  vec2 q=vec2(across+uWidth*0.5,plane.y+uDepth)*frequency;
  vec2 distance=abs(fract(q+0.5)-0.5);
  // Each separated solid keeps a continuous ink line along its straight top
  // and bottom edges, even when those heights fall between the square grid's
  // regular rows. Draw it on the side wall so the horizontal top surfaces
  // remain clean while their perimeter stays legible.
  float blockEdgeDistance=1000000.0;
  if(plateGap>0.0&&region>0.5&&region<1.5) {
    if(slice<4.0) {
      float plateBottom=-uDepth+slice*plateThickness;
      float plateTop=plateBottom+plateThickness;
      blockEdgeDistance=min(abs(plane.y-plateBottom),abs(plane.y-plateTop))*frequency;
    } else {
      float upperBottom=-uDepth+4.0*plateThickness;
      blockEdgeDistance=abs(plane.y-upperBottom)*frequency;
    }
  }
  float halfStroke=uGridThickness*0.005;
  float aa=max(0.0001,footprint*frequency*0.6);
  // Replace the nearest regular horizontal row around a separated boundary.
  // Keeping both rows lets two almost-coincident strokes merge into a heavy
  // band. The perimeter remains visible, but uses a lighter stroke because it
  // is already reinforced visually by the dark printed plane beside it.
  float horizontalDistance=blockEdgeDistance<0.5?1000000.0:distance.y;
  float regularDistance=min(distance.x,horizontalDistance);
  float regularLines=1.0-smoothstep(halfStroke-aa,halfStroke+aa,regularDistance);
  float edgeHalfStroke=halfStroke*0.5;
  float edgeLines=1.0-smoothstep(edgeHalfStroke-aa,edgeHalfStroke+aa,blockEdgeDistance);
  float lines=max(regularLines,edgeLines);
  float average=1.0-pow(1.0-2.0*halfStroke,2.0);
  return mix(lines,average,smoothstep(0.35,1.0,aa))*uGridStrength;
}
`;

const PLATE_PATTERN = `
uniform float uPlaneLineThickness, uPlaneLineDensity, uPlaneLineDirection;

float platePlaneLineInk(vec3 world, float region, float slice) {
  // Region 3 is the upward-facing face of each lower plate. Keep the mountain,
  // upper block and vertical grid on their existing materials.
  if(region<2.5||slice>=4.0) return 0.0;

  // Rotate a world-space line basis, then bend its cross-axis coordinate with
  // low-frequency noise. This keeps a readable common direction while avoiding
  // mechanically straight stripes. Slice phase varies the four exposed prints.
  float angle=radians(uPlaneLineDirection);
  vec2 direction=vec2(cos(angle),sin(angle));
  vec2 acrossAxis=vec2(-direction.y,direction.x);
  vec2 q=world.xz/max(0.0001,uWidth);
  vec2 local=vec2(dot(q,direction),dot(q,acrossAxis));
  float slicePhase=uSeed*0.071+slice*8.41;
  vec2 warp=vec2(
    noise2(local*vec2(1.45,1.10)+vec2(slicePhase,11.3)),
    noise2(local*vec2(1.15,1.70)+vec2(19.7,slicePhase))
  )-0.5;
  float broad=noise2((local+warp*0.34)*vec2(2.35,1.75)+vec2(slicePhase,7.1))-0.5;
  float detail=noise2((local+warp*0.16)*vec2(6.2,3.8)+vec2(23.4,slicePhase))-0.5;
  float displacement=broad*0.24+detail*0.065;
  float density=clamp(uPlaneLineDensity,4.0,96.0);
  float phase=(local.y+displacement)*density+slice*0.37;
  float lineDistance=abs(fract(phase)-0.5);
  float halfWidth=clamp(uPlaneLineThickness,5.0,90.0)*0.005;
  float aa=clamp(fwidth(phase)*0.55,0.001,0.24);
  return 1.0-smoothstep(halfWidth-aa,halfWidth+aa,lineDistance);
}

float platePlanePrintShade(
  float litShade,
  float ink,
  float grain,
  float region,
  float slice
) {
  // The exposed plate planes read as a graphic printed material rather than
  // another lit grid face. Keep almost-white paper and almost-black ink stable
  // under the scene light, with only a small amount of the shared film grain.
  float planeMask=step(2.5,region)*(1.0-step(3.5,slice));
  float printShade=clamp(mix(0.985,0.025,ink)+grain*0.08,0.025,1.0);
  return mix(litShade,printShade,planeMask);
}
`;

const ENGRAVING = `
uniform bool uEngravingEnabled;
uniform float uEngravingStrength, uEngravingScale, uEngravingThickness;
varying float vPrintY;

float engravedStripeIntegral(float phase, float coverage) {
  return floor(phase)*coverage+min(fract(phase),coverage);
}
float engraveRock(float shade) {
  if(!uEngravingEnabled) return shade;
  // A printing-screen coordinate, rather than surface height: every stroke
  // stays horizontal while lighting and relief keep describing the 3D rock.
  float coverage=clamp((1.0-clamp(shade,0.0,1.0))*uEngravingThickness/50.0,0.015,0.965);
  float phase=vPrintY*280.0/max(0.5,uEngravingScale)+coverage*0.5;
  float footprint=max(fwidth(vPrintY)*280.0/max(0.5,uEngravingScale),0.0001);
  // Integrate the periodic ink stroke over a pixel. Fine lines retain their
  // average tone when zoomed out, using the same pattern for preview/export.
  float ink=(engravedStripeIntegral(phase+footprint*0.5,coverage)
            -engravedStripeIntegral(phase-footprint*0.5,coverage))/footprint;
  float engraving=mix(0.98,0.045,clamp(ink,0.0,1.0));
  return mix(shade,engraving,uEngravingStrength);
}
`;

const TERRAIN = `
uniform float uHeight, uWidth, uSharpness, uAsymmetry, uShoulder, uSeed;
uniform float uRidges, uFrequency, uErosion, uDetail;
uniform float uDepth, uSeamLevel, uSeamVariation, uSeamFrequency, uCliff;
uniform float uSeamValley, uSeamPhase, uSeamWarp, uSeamTerraces;
float hash21(vec2 p) { return fract(sin(dot(p, vec2(127.1,311.7))) * 43758.5453); }
float noise2(vec2 p) {
  vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float fbm(vec2 p) { return noise2(p)*0.53+noise2(p*2.07+8.1)*0.27+noise2(p*4.13+19.3)*0.13+noise2(p*8.17+2.4)*0.07; }
float angularNoise(vec2 p) {
  vec2 i=floor(p), f=fract(p);
  return mix(mix(hash21(i),hash21(i+vec2(1,0)),f.x),mix(hash21(i+vec2(0,1)),hash21(i+vec2(1,1)),f.x),f.y);
}
float polarAngle(vec2 p) {
  // Keep axis vertices (including the origin) out of atan's undefined input.
  return p.x==0.0 ? sign(p.y)*1.57079632679 : atan(p.y,p.x);
}
float seam(vec2 p) {
  vec2 s=vec2(uSeed*1.13,uSeed*0.71);
  // Warp the coordinates, so nested cuts have unequal shoulders and widths.
  vec2 warp=vec2(noise2(p*1.65+s),noise2(p*2.1+s+vec2(8.4,3.7)))-0.5;
  vec2 q=p+warp*uSeamWarp*0.58;
  float angle=polarAngle(p);
  float bentAngle=angle+uSeamWarp*(warp.x*1.6+sin(angle*3.0+uSeed)*0.18);
  float bay=pow(smoothstep(-0.65,0.96,cos(bentAngle-radians(uSeamPhase))),1.55);
  // The angular excavation has no direction at the center of the height field.
  bay*=smoothstep(0.0,0.15,length(p));
  // Unequally spaced shelves sit inside the broad excavation.
  float shelves=0.24*smoothstep(0.12,0.21,bay)
               +0.33*smoothstep(0.38,0.49,bay)
               +0.43*smoothstep(0.73,0.88,bay);
  float excavation=mix(bay,shelves,uSeamTerraces*0.8);
  vec2 cutCoords=q*uSeamFrequency*0.48+s;
  float cuts=noise2(cutCoords);
  float cutSteps=0.55*smoothstep(0.26,0.36,cuts)+0.45*smoothstep(0.62,0.76,cuts);
  cuts=mix(cuts,cutSteps,uSeamTerraces);
  vec2 nestedCoords=cutCoords*2.37+vec2(cuts*2.1,warp.y*3.0);
  float nested=mix(noise2(nestedCoords),angularNoise(nestedCoords),uSeamWarp);
  float chips=angularNoise(cutCoords*5.13+vec2(nested*1.7,0.0));
  float fracture=(cuts*0.58+nested*0.28+chips*0.14)*2.0-1.0;
  // Limit the large excavation first, preserving the small cuts in deep bays.
  float clearance=max(0.12,uSeamLevel+uDepth-0.12);
  float floorLevel=uSeamLevel-clearance;
  float height=uSeamLevel-clearance*(1.0-exp(-uSeamValley*excavation/clearance))+uSeamVariation*fracture;
  float cushion=min(0.16,clearance*0.25);
  return height<floorLevel+cushion
    ? floorLevel+cushion*exp((height-floorLevel-cushion)/cushion)
    : height;
}
float terrain(vec2 p,float boundary) {
  vec2 peak=vec2(uAsymmetry*0.42,-uAsymmetry*0.18);
  vec2 q=p-peak;
  vec2 extent=vec2(q.x>0.0?1.0-peak.x:1.0+peak.x,q.y>0.0?1.0-peak.y:1.0+peak.y);
  float d=clamp(max(abs(q.x)/extent.x,abs(q.y)/extent.y),0.0,1.0);
  float radius=length(q);
  float angle=polarAngle(q);
  vec2 ns=vec2(uSeed*0.83,uSeed*1.29);
  float warp=fbm(p*3.0+ns);
  // Each integer harmonic closes around the mountain. Blend their heights
  // for fractional frequencies; multiplying the angle by a fractional count
  // creates a height jump at -PI / PI and a thin vertical fin in the mesh.
  float frequency=floor(uFrequency), phase=warp*2.8+radius*1.1;
  float lowerFolds=pow(abs(sin(angle*frequency*0.5+phase)),1.4);
  float upperFolds=pow(abs(sin(angle*(frequency+1.0)*0.5+phase)),1.4);
  float folds=mix(lowerFolds,upperFolds,fract(uFrequency));
  float ridgeShape=1.0-uRidges*folds*smoothstep(0.025,0.28,radius);
  float mainPeak=pow(max(0.0,1.0-d),uSharpness)*uHeight*ridgeShape;
  float sideDistance=length((p-vec2(-0.46,0.08))*vec2(1.0,1.2));
  float sidePeak=pow(max(0.0,1.0-sideDistance/0.65),1.35)*uHeight*uShoulder;
  // The shoulder's support reaches beyond the square. Taper only its outer
  // strip so the cap meets the wall at the exact same seam height.
  sidePeak*=smoothstep(0.0,0.12,1.0-d);
  float mountain=max(mainPeak,sidePeak);
  float envelope=sin(min(d,1.0-d)*3.14159265);
  mountain+=uCliff*pow(max(0.0,envelope),0.35)*(0.55+0.45*warp);
  mountain+=(fbm(p*15.0+ns)*2.0-1.0)*uErosion*envelope;
  mountain+=(noise2(p*52.0+ns)-0.5)*uDetail*0.12*envelope;
  return uSeamLevel+(boundary-uSeamLevel)*pow(d,2.5)+max(0.0,mountain);
}
`;

const VERTEX_SHADER = `
${TERRAIN}
attribute float region;
attribute float slice;
uniform float uPlateGap, uPlateThickness;
varying float vSlice;
varying float vPrintY;
varying vec3 vWorld;
varying float vRegion;
varying float vSeamDistance;
varying vec3 vBoundaryNormal;
varying vec3 vIceNormal;
vec3 boundaryNormal(vec2 edge) {
  // Sample the same inner rock slope for cap and wall vertices. This carries
  // the relief's lighting through a material cut without displacing geometry.
  float e=1.0/192.0;
  vec2 c=edge*(1.0-e);
  vec2 dx=vec2(e,0.0), dz=vec2(0.0,e);
  float hx=terrain(c+dx,seam(c+dx))-terrain(c-dx,seam(c-dx));
  float hz=terrain(c+dz,seam(c+dz))-terrain(c-dz,seam(c-dz));
  return normalize(vec3(-hx,e*uWidth,-hz));
}
void main() {
  vec3 p=position;
  vec2 ground=p.xz;
  float radius=max(abs(ground.x),abs(ground.y));
  vec2 edge=ground/max(0.0001,radius);
  float boundary=seam(ground);
  float bottom=uPlateGap>0.0?-uDepth+4.0*uPlateThickness:-uDepth;
  if(slice<4.0) p.y=-uDepth+(slice+position.y)*uPlateThickness;
  else if(region<0.5) p.y=terrain(ground,boundary);
  else if(region<1.5) p.y=mix(bottom,boundary,position.y);
  else p.y=bottom;
  vSeamDistance=p.y-boundary;
  if(region<0.5) {
    // Distance to the physical perimeter, not an interior height-field contour.
    vSeamDistance=length(vec3((ground-edge)*uWidth*0.5,p.y-seam(edge)));
  }
  vBoundaryNormal=boundaryNormal(edge);
  vIceNormal=abs(edge.x)>=abs(edge.y)?vec3(sign(edge.x),0,0):vec3(0,0,sign(edge.y));
  p.xz*=uWidth*0.5;
  vWorld=p; vRegion=region; vSlice=slice;
  // Print and grain stay in the unsplit material coordinates. Only geometry
  // translates, so the grid travels with each rigid plate.
  p.y+=(slice-4.0)*uPlateGap;
  vec4 viewPosition=modelViewMatrix*vec4(p,1.0);
  gl_Position=projectionMatrix*viewPosition;
  // Printing scale/phase stays fixed when the render frame grows around it.
  vPrintY=viewPosition.y/7.0+0.5;
}
`;

const FRAGMENT_SHADER = `
${TERRAIN}
uniform vec3 uRockColor, uIceColor;
uniform float uPlateGap, uPlateThickness;
varying float vSlice;
uniform float uContrast, uGrain, uLight, uLightDrama, uSeamJagged, uSeamScale;
varying vec3 vWorld;
varying float vRegion;
varying float vSeamDistance;
varying vec3 vBoundaryNormal;
varying vec3 vIceNormal;
float grain3(vec3 p) { return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453); }
${CUBE_PATTERN}
${PLATE_PATTERN}
${ENGRAVING}
float edgeRockMask() {
  float original=vRegion<0.5?1.0:0.0;
  // This setting changes only the material contour, never vertex heights.
  float band=uSeamJagged*uSeamScale*0.10;
  float aa=clamp(fwidth(vSeamDistance)*0.4,0.0001,0.008);
  if(band<=0.0||abs(vSeamDistance)>=band||vRegion>1.5||vSlice<4.0) return original;
  // A two-dimensional, world-anchored cut pattern creates lateral notches too.
  vec2 q=vec2(vWorld.x*19.0+vWorld.z*23.0,vWorld.y*27.0)/uSeamScale+uSeed;
  vec2 warp=vec2(noise2(q*0.81+7.1),noise2(q*0.91+19.4))-0.5;
  float cuts=(angularNoise(q+warp*2.0)-0.5)*1.2;
  cuts+=(angularNoise(q*2.7+warp)-0.5)*0.42;
  float distance=vSeamDistance+band*cuts;
  return smoothstep(-aa,aa,distance);
}
void main() {
  // At zero keep the original unsplit topology's output, including its bottom.
  if(uPlateGap<=0.0&&vSlice<4.0) discard;
  vec3 n=normalize(cross(dFdx(vWorld),dFdy(vWorld)));
  if(!gl_FrontFacing) n=-n;
  float a=radians(uLight);
  // Lower the key light and remove fill together, so drama reveals facet
  // direction instead of merely darkening the whole image. Zero is the
  // original lighting, including its azimuth and ambient contribution.
  vec3 softLight=vec3(cos(a)*1.5,2.6,-sin(a)*0.65);
  vec3 sideLight=vec3(cos(a)*1.5,0.7,-sin(a)*0.65);
  vec3 light=normalize(mix(softLight,sideLight,uLightDrama));
  float band=uSeamJagged*uSeamScale*0.10;
  float join=band>0.0&&abs(vSeamDistance)<band&&vRegion<1.5
    ? (1.0-smoothstep(0.0,band,max(0.0,vSeamDistance)))*smoothstep(0.0,0.15,uSeamJagged)
    : 0.0;
  vec3 rockNormal=join>0.0?normalize(mix(n,normalize(vBoundaryNormal),join)):n;
  vec3 iceNormal=join>0.0&&vRegion<0.5?normalize(mix(n,normalize(vIceNormal),join)):n;
  float diffuse=max(0.0,dot(rockNormal,light));
  vec2 veins=vWorld.xz*7.5+vec2(vWorld.y*0.42,uSeed);
  float striation=fbm(veins+vec2(fbm(vWorld.xz*4.0+uSeed),0.0)*3.0);
  float micro=(noise2(vWorld.xz*90.0+vWorld.y*vec2(4,2))-0.5)*uDetail;
  float rockShade=mix(0.25,0.045,uLightDrama)
                 +pow(diffuse,mix(1.0,1.2,uLightDrama))*mix(0.95,1.65,uLightDrama);
  rockShade*=mix(0.55,1.2,smoothstep(0.25,0.72,striation+micro*0.3));
  rockShade=mix(rockShade,smoothstep(0.16,0.8,rockShade),uContrast);
  rockShade=engraveRock(rockShade);
  float iceShade=mix(0.57,0.38,uLightDrama)
                +max(0.0,dot(iceNormal,light))*mix(0.46,0.66,uLightDrama);
  float rockMask=edgeRockMask();
  iceShade*=1.0-0.93*cubePatternInk(vWorld,vRegion,rockMask,vSlice,uPlateGap,uPlateThickness);
  float planeInk=platePlaneLineInk(vWorld,vRegion,vSlice);
  vec3 tint=mix(uIceColor,uRockColor,rockMask);
  float shade=mix(iceShade,rockShade,rockMask);
  float grain=(grain3(floor(vWorld*1050.0))-0.5)*uGrain;
  shade=clamp(shade+grain*mix(0.65,1.1,rockMask),0.025,1.0);
  shade=platePlanePrintShade(shade,planeInk,grain,vRegion,vSlice);
  vec3 c=pow(tint,vec3(1.0/2.2))*shade;
  gl_FragColor=vec4(c,1.0);
}
`;

// ---------------------------------------------------------------------------
// Geometry, verbatim: region 0 = height field, 1 = walls, 2 = bottom,
// 3 = plate tops. Slice 0 to 3 are the plates, 4 is the mountain block.

function buildGeometry() {
  const position: number[] = [];
  const region: number[] = [];
  const index: number[] = [];
  const N = 192;
  for (let z = 0; z <= N; z++)
    for (let x = 0; x <= N; x++) {
      position.push((x / N) * 2 - 1, 0, (z / N) * 2 - 1);
      region.push(0);
    }
  for (let z = 0; z < N; z++)
    for (let x = 0; x < N; x++) {
      const a = z * (N + 1) + x;
      const b = a + 1;
      const c = a + N + 1;
      const d = c + 1;
      index.push(a, c, b, b, c, d);
    }
  const side = (face: number, t: number): [number, number] =>
    face === 0
      ? [t, 1]
      : face === 1
        ? [1, -t]
        : face === 2
          ? [-t, -1]
          : [-1, t];
  for (let face = 0; face < 4; face++) {
    const start = position.length / 3;
    for (let i = 0; i <= N; i++) {
      const [x, z] = side(face, (i / N) * 2 - 1);
      position.push(x, 0, z, x, 1, z);
      region.push(1, 1);
    }
    for (let i = 0; i < N; i++) {
      const v = start + i * 2;
      index.push(v, v + 2, v + 1, v + 1, v + 2, v + 3);
    }
  }
  const bottom = position.length / 3;
  position.push(-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1);
  region.push(2, 2, 2, 2);
  index.push(bottom, bottom + 1, bottom + 2, bottom, bottom + 2, bottom + 3);
  const slice: number[] = new Array(region.length).fill(4);
  const plateFaces = [
    [-1, 0, 1, 1, 0, 1, 1, 1, 1, -1, 1, 1],
    [1, 0, 1, 1, 0, -1, 1, 1, -1, 1, 1, 1],
    [1, 0, -1, -1, 0, -1, -1, 1, -1, 1, 1, -1],
    [-1, 0, -1, -1, 0, 1, -1, 1, 1, -1, 1, -1],
    [-1, 0, -1, 1, 0, -1, 1, 0, 1, -1, 0, 1],
    [-1, 1, 1, 1, 1, 1, 1, 1, -1, -1, 1, -1],
  ];
  for (let plate = 0; plate < 4; plate++)
    for (const [i, face] of plateFaces.entries()) {
      const v = position.length / 3;
      position.push(...face);
      const r = i < 4 ? 1 : i === 4 ? 2 : 3;
      region.push(r, r, r, r);
      slice.push(plate, plate, plate, plate);
      index.push(v, v + 1, v + 2, v, v + 2, v + 3);
    }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute(
    "position",
    new THREE.Float32BufferAttribute(position, 3),
  );
  geometry.setAttribute("region", new THREE.Float32BufferAttribute(region, 1));
  geometry.setAttribute("slice", new THREE.Float32BufferAttribute(slice, 1));
  geometry.setIndex(index);
  return geometry;
}

/** Thickness of each of the four plates under the deepest recess. */
function plateThickness(s: NeonIcebergSettings) {
  const clearance = Math.max(0.12, s.seamLevel + s.depth - 0.12);
  const floorLevel = s.seamLevel - clearance;
  const cushion = Math.min(0.16, clearance * 0.25);
  const lowest =
    s.seamLevel -
    clearance * (1 - Math.exp(-s.seamValley / clearance)) -
    s.seamVariation;
  const recess =
    lowest < floorLevel + cushion
      ? floorLevel +
        cushion * Math.exp((lowest - floorLevel - cushion) / cushion)
      : lowest;
  return (s.depth + Math.min(s.seamLevel, recess)) / 4;
}

// ---------------------------------------------------------------------------
// Orbit, verbatim: a drag rotates the pose quaternion about world up (x) and
// about an axis blended between the horizon tangent and the camera's right
// vector (y), at PI/450 radians per pixel.

type Vec3 = [number, number, number];
const EPS = 1e-9;
const ORBIT_RAD_PER_PX = Math.PI / 450;
const WORLD_UP: Vec3 = [0, 1, 0];

const len = (v: Vec3) => Math.hypot(v[0], v[1], v[2]);
const norm = (v: Vec3): Vec3 => {
  const l = len(v);
  return l <= EPS ? [0, 0, 0] : [v[0] / l, v[1] / l, v[2] / l];
};
const cross = (a: Vec3, b: Vec3): Vec3 => [
  a[1] * b[2] - a[2] * b[1],
  a[2] * b[0] - a[0] * b[2],
  a[0] * b[1] - a[1] * b[0],
];
const dot = (a: Vec3, b: Vec3) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];

function poseQuaternion(pose: NeonIcebergPose) {
  const z = norm(pose.position);
  const x = norm(cross(pose.up, z));
  const y = norm(cross(z, x));
  const m = new THREE.Matrix4().makeBasis(
    new THREE.Vector3(...x),
    new THREE.Vector3(...y),
    new THREE.Vector3(...z),
  );
  return new THREE.Quaternion().setFromRotationMatrix(m).normalize();
}

function rotate(v: Vec3, q: THREE.Quaternion): Vec3 {
  const r = new THREE.Vector3(...v).applyQuaternion(q);
  return [r.x, r.y, r.z];
}

function axisAngle(axis: Vec3, angle: number) {
  const a = norm(axis);
  const h = Number.isFinite(angle) ? angle / 2 : 0;
  const s = Math.sin(h);
  return new THREE.Quaternion(
    a[0] * s,
    a[1] * s,
    a[2] * s,
    Math.cos(h),
  ).normalize();
}

function orbitPose(
  pose: NeonIcebergPose,
  dx: number,
  dy: number,
): NeonIcebergPose {
  if (!Number.isFinite(dx) || !Number.isFinite(dy)) return pose;
  const q = poseQuaternion(pose);
  const forward = norm(pose.position);
  const right = norm(rotate([1, 0, 0], q));
  const tangent = cross(WORLD_UP, forward);
  let pitchAxis = right;
  if (dot(tangent, tangent) > 0.001) {
    const horizon =
      dot(tangent, right) < 0 ? (tangent.map((c) => -c) as Vec3) : tangent;
    let t =
      Math.acos(Math.max(-1, Math.min(1, dot(WORLD_UP, forward)))) / Math.PI;
    t = Math.abs(t - 0.5) * 2;
    t *= t;
    pitchAxis = norm([
      horizon[0] + (right[0] - horizon[0]) * t,
      horizon[1] + (right[1] - horizon[1]) * t,
      horizon[2] + (right[2] - horizon[2]) * t,
    ]);
  }
  const pitch = axisAngle(pitchAxis, -dy * ORBIT_RAD_PER_PX);
  const next = axisAngle(WORLD_UP, -dx * ORBIT_RAD_PER_PX)
    .multiply(pitch)
    .multiply(q)
    .normalize();
  return {
    position: rotate([0, 0, len(pose.position)], next),
    up: norm(rotate([0, 1, 0], next)),
  };
}

// ---------------------------------------------------------------------------

/**
 * An engraved iceberg on a gridded block that parts into four printed plates
 * on a loop. Drag on the iceberg to orbit it. Fills its parent; give the
 * parent a height. The 3:4 artboard is contained and centred in the box.
 */
export default function NeonIceberg({
  settings,
  orbit = DEFAULT_ORBIT,
  playing = true,
  duration = 2,
  background = "#FAFAFA",
  renderScale = 2,
  className,
  style,
}: NeonIcebergProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const resolved: NeonIcebergSettings = {
    ...NEON_ICEBERG_DEFAULTS,
    ...settings,
  };
  const settingsKey = JSON.stringify(resolved);
  const stateRef = useRef({
    settings: resolved,
    playing,
    duration,
    renderScale,
  });
  stateRef.current = { settings: resolved, playing, duration, renderScale };
  const initialOrbit = useRef(orbit);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        alpha: true,
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      return;
    }
    renderer.setClearColor(0, 0);
    renderer.toneMapping = THREE.NoToneMapping;

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(
      -2.5,
      2.5,
      3.5,
      -3.5,
      0.01,
      100,
    );
    const uniforms: Record<string, THREE.IUniform> = Object.fromEntries(
      NUMERIC_KEYS.map((key) => [
        uniformName(key),
        { value: NEON_ICEBERG_DEFAULTS[key] },
      ]),
    );
    uniforms.uRockColor = { value: new THREE.Color("#D9DDE0") };
    uniforms.uIceColor = { value: new THREE.Color("#F0F1F2") };
    uniforms.uViewDirection = { value: new THREE.Vector3() };
    uniforms.uEngravingEnabled = { value: false };
    uniforms.uPlateThickness = { value: 0 };
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      side: THREE.DoubleSide,
    });
    const geometry = buildGeometry();
    const mesh = new THREE.Mesh(geometry, material);
    mesh.frustumCulled = false;
    scene.add(mesh);

    let pose = initialOrbit.current;
    let cssWidth = 1;
    let cssHeight = 1;
    let time = 0;
    let last = performance.now();
    let frame = 0;
    let visible = true;
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

    // Plates ease out over each loop: gap * (1 - (1 - p)^4).
    const plateProgress = () => {
      const { playing: on, duration: d } = stateRef.current;
      if (reducedMotion.matches) return 1;
      if (!on || !(d > 0)) return 1;
      const p = (((time % d) + d) % d) / d;
      return 1 - (1 - Math.max(0, Math.min(1, p))) ** 4;
    };

    const draw = () => {
      const { settings: s, renderScale: scale } = stateRef.current;
      for (const key of NUMERIC_KEYS) uniforms[uniformName(key)].value = s[key];
      uniforms.uPlateGap.value = s.plateGap * plateProgress();
      (uniforms.uRockColor.value as THREE.Color).set(s.rockColor);
      (uniforms.uIceColor.value as THREE.Color).set(s.iceColor);
      uniforms.uEngravingEnabled.value = s.engravingEnabled;
      uniforms.uPlateThickness.value = plateThickness(s);
      (uniforms.uViewDirection.value as THREE.Vector3)
        .set(...pose.position)
        .normalize();

      // Contain the artboard, keeping its 200 px per unit relationship.
      const pxPerUnit =
        PX_PER_UNIT *
        Math.min(cssWidth / ARTBOARD_WIDTH, cssHeight / ARTBOARD_HEIGHT);
      camera.left = -cssWidth / 2 / pxPerUnit;
      camera.right = cssWidth / 2 / pxPerUnit;
      camera.top = cssHeight / 2 / pxPerUnit;
      camera.bottom = -cssHeight / 2 / pxPerUnit;
      camera.updateProjectionMatrix();
      camera.position
        .set(...pose.position)
        .normalize()
        .multiplyScalar(CAMERA_DISTANCE);
      camera.position.y += TARGET_Y;
      camera.up.set(...pose.up);
      camera.lookAt(0, TARGET_Y, 0);
      camera.updateMatrixWorld();

      let ratio = Math.max(1, window.devicePixelRatio || 1) * scale;
      const pixels = cssWidth * cssHeight * ratio * ratio;
      if (pixels > MAX_BACKING_PIXELS)
        ratio *= Math.sqrt(MAX_BACKING_PIXELS / pixels);
      const w = Math.max(1, Math.round(cssWidth * ratio));
      const h = Math.max(1, Math.round(cssHeight * ratio));
      if (canvas.width !== w || canvas.height !== h)
        renderer.setSize(w, h, false);
      renderer.setRenderTarget(null);
      renderer.render(scene, camera);
    };

    const animating = () =>
      visible &&
      stateRef.current.playing &&
      stateRef.current.duration > 0 &&
      !reducedMotion.matches;

    const tick = (now: number) => {
      frame = 0;
      time += (now - last) / 1000;
      last = now;
      draw();
      if (animating()) frame = requestAnimationFrame(tick);
    };
    const requestDraw = () => {
      if (frame) return;
      last = performance.now();
      frame = requestAnimationFrame(tick);
    };

    const resize = () => {
      cssWidth = Math.max(1, canvas.clientWidth);
      cssHeight = Math.max(1, canvas.clientHeight);
      requestDraw();
    };
    resize();
    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(canvas);
    const visibility = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting;
      if (visible) requestDraw();
    });
    visibility.observe(canvas);
    reducedMotion.addEventListener("change", requestDraw);

    // Orbit drag starts only on the iceberg's own pixels, as in the source.
    const hitTest = (x: number, y: number) => {
      const rect = canvas.getBoundingClientRect();
      const px = Math.floor(((x - rect.left) / rect.width) * canvas.width);
      const py = Math.floor(((rect.bottom - y) / rect.height) * canvas.height);
      if (px < 0 || py < 0 || px >= canvas.width || py >= canvas.height)
        return false;
      const gl = renderer.getContext();
      const out = new Uint8Array(4);
      gl.readPixels(px, py, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, out);
      return out[3] > 127;
    };
    let drag: {
      id: number;
      x: number;
      y: number;
      dx: number;
      dy: number;
    } | null = null;
    let orbitFrame = 0;
    const applyOrbit = () => {
      orbitFrame = 0;
      if (!drag || (drag.dx === 0 && drag.dy === 0)) return;
      pose = orbitPose(pose, drag.dx, drag.dy);
      drag.dx = 0;
      drag.dy = 0;
      requestDraw();
    };
    const onDown = (e: PointerEvent) => {
      if (e.button !== 0 || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey)
        return;
      if (!hitTest(e.clientX, e.clientY)) return;
      e.preventDefault();
      e.stopPropagation();
      drag = { id: e.pointerId, x: e.clientX, y: e.clientY, dx: 0, dy: 0 };
      canvas.setPointerCapture(e.pointerId);
      canvas.dataset.orbiting = "true";
    };
    const onMove = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      e.preventDefault();
      drag.dx += e.clientX - drag.x;
      drag.dy += e.clientY - drag.y;
      drag.x = e.clientX;
      drag.y = e.clientY;
      if (!orbitFrame) orbitFrame = requestAnimationFrame(applyOrbit);
    };
    const onEnd = (e: PointerEvent) => {
      if (!drag || drag.id !== e.pointerId) return;
      cancelAnimationFrame(orbitFrame);
      applyOrbit();
      drag = null;
      delete canvas.dataset.orbiting;
    };
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerup", onEnd);
    canvas.addEventListener("pointercancel", onEnd);
    canvas.addEventListener("lostpointercapture", onEnd);

    const redraw = () => requestDraw();
    canvas.addEventListener("nib:redraw", redraw);

    return () => {
      cancelAnimationFrame(frame);
      cancelAnimationFrame(orbitFrame);
      resizeObserver.disconnect();
      visibility.disconnect();
      reducedMotion.removeEventListener("change", requestDraw);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerup", onEnd);
      canvas.removeEventListener("pointercancel", onEnd);
      canvas.removeEventListener("lostpointercapture", onEnd);
      canvas.removeEventListener("nib:redraw", redraw);
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  // Settings, playback or scale changed: redraw (and restart the loop if needed).
  useEffect(() => {
    canvasRef.current?.dispatchEvent(new Event("nib:redraw"));
  }, [settingsKey, playing, duration, renderScale]);

  return (
    <div
      className={className}
      style={{
        position: "relative",
        width: "100%",
        height: "100%",
        overflow: "hidden",
        background,
        ...style,
      }}
    >
      <canvas
        ref={canvasRef}
        aria-label="3D iceberg. Drag on it to orbit."
        role="img"
        style={{
          display: "block",
          width: "100%",
          height: "100%",
          touchAction: "none",
        }}
      />
    </div>
  );
}
