// Portrait -> point cloud -> neural field. All motion is uniform driven.

const noise = /* glsl */ `
vec3 hash3(vec3 p){
  p = vec3(dot(p,vec3(127.1,311.7,74.7)), dot(p,vec3(269.5,183.3,246.1)), dot(p,vec3(113.5,271.9,124.6)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float vnoise(vec3 p){
  vec3 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
  return mix(mix(mix(dot(hash3(i),f), dot(hash3(i+vec3(1,0,0)),f-vec3(1,0,0)),f.x),
                 mix(dot(hash3(i+vec3(0,1,0)),f-vec3(0,1,0)), dot(hash3(i+vec3(1,1,0)),f-vec3(1,1,0)),f.x),f.y),
             mix(mix(dot(hash3(i+vec3(0,0,1)),f-vec3(0,0,1)), dot(hash3(i+vec3(1,0,1)),f-vec3(1,0,1)),f.x),
                 mix(dot(hash3(i+vec3(0,1,1)),f-vec3(0,1,1)), dot(hash3(i+vec3(1,1,1)),f-vec3(1,1,1)),f.x),f.y),f.z);
}`;

export const pointsVertex = /* glsl */ `
attribute vec3 aSeed;
attribute vec3 aColor;
attribute float aLum;
uniform float uTime, uScan, uPulse, uSettle, uDisperse, uSize, uPR, uFieldW, uFieldH, uMotion, uKeep;
uniform vec2 uPointer;
varying vec3 vColor;
varying float vAlpha;
varying float vLum;
${noise}
void main(){
  vec3 p = position;
  float t = 0.5 - p.y;                       // 0 at head, 1 at bottom
  float scanReveal = 1.0 - smoothstep(uScan - 0.16, uScan, t);
  float edge = smoothstep(uScan - 0.16, uScan - 0.02, t) * (1.0 - smoothstep(uScan - 0.02, uScan + 0.01, t));

  float pulse = smoothstep(0.03, 0.0, abs(t - uPulse)) * (1.0 - smoothstep(0.0, 0.6, uDisperse));

  // relief from luminance; a slow breathing so the cloud reads as 3D
  p.z += (aLum - 0.5) * 0.1 + vnoise(vec3(p.xy * 3.0, uTime * 0.35 * uMotion)) * 0.012;

  // points spawn scattered, then lock to the face as the scan line passes
  vec3 scatter = (aSeed - 0.5) * vec3(0.9, 0.9, 1.4);
  p += scatter * (1.0 - scanReveal) * 1.2;

  // neural field: seven depth layers, each a drifting sheet of nodes
  float layer = floor(aSeed.x * 7.0);
  vec3 f;
  f.x = (layer / 6.0 - 0.5) * uFieldW * 1.15;
  f.y = (aSeed.y - 0.5) * uFieldH * 1.1 + sin(uTime * 0.25 * uMotion + aSeed.z * 20.0) * 0.06;
  f.z = (aSeed.z - 0.5) * 2.6 - 0.4;
  f.x += sin(uTime * 0.2 * uMotion + aSeed.y * 30.0) * 0.05;
  float d = smoothstep(aSeed.z * 0.45, aSeed.z * 0.45 + 0.55, uDisperse);
  p = mix(p, f, d);

  // pointer repulsion in portrait space
  vec2 dp = p.xy - uPointer;
  float push = smoothstep(0.32, 0.0, length(dp)) * (1.0 - d * 0.7);
  p.xy += normalize(dp + 1e-4) * push * 0.05;
  p.z += push * 0.12;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;

  float cell = uSize;                          // px size of one pixel-cell at rest
  float s = cell * mix(0.7 + aLum * 0.8, 0.45 + aSeed.x * 0.7, d);
  s *= 1.0 + push * 0.9 + edge * 1.4 + pulse * 0.7;
  s *= step(aSeed.y, uKeep);                  // adaptive density: cull by seed
  gl_PointSize = s * uPR * (5.0 / -mv.z);

  vLum = aLum;
  vColor = aColor;
  float rest = 1.0 - 0.995 * uSettle * (1.0 - d);
  vAlpha = mix(1.0, 0.1 + aSeed.y * 0.3, d) * smoothstep(0.35, 1.0, scanReveal) * (1.0 - smoothstep(0.8, 1.0, t)) * min(1.0, rest + push * 1.4 * (1.0 - uSettle * (1.0 - d)) + pulse * 0.6) * smoothstep(0.0, 0.14, uDisperse);
  vColor = mix(vColor, vec3(0.78, 1.0, 0.24), max(edge * 0.9 + d * 0.8, pulse));
}`;

export const pointsFragment = /* glsl */ `
precision mediump float;
varying vec3 vColor;
varying float vAlpha;
varying float vLum;
void main(){
  vec2 c = gl_PointCoord - 0.5;
  float r = length(c);
  if (r > 0.5) discard;
  float a = smoothstep(0.5, 0.15, r) * vAlpha;
  // slight duotone lift toward lime in highlights
  vec3 col = mix(vColor, vColor * vec3(0.9, 1.08, 0.7) + vec3(0.02, 0.05, 0.0), 0.25) * 1.3 + 0.04;
  gl_FragColor = vec4(col, a);
}`;

export const planeVertex = /* glsl */ `
varying vec2 vUv;
void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }`;

export const planeFragment = /* glsl */ `
precision mediump float;
uniform sampler2D uMap;
uniform float uScan, uPulse, uOpacity, uSettle, uAspect, uCells;
uniform vec2 uPointer;
varying vec2 vUv;
float luma(vec3 c){ return dot(c, vec3(0.2126, 0.7152, 0.0722)); }
void main(){
  vec4 tex = texture2D(uMap, vUv);
  float aMask = smoothstep(0.52, 0.93, tex.a) * smoothstep(0.0, 0.2, vUv.y);
  float t = 1.0 - vUv.y;

  // the photograph, graded and with a darkened fringe so the cutout edge disappears
  vec3 photo = mix(vec3(luma(tex.rgb)), tex.rgb, 0.8) * mix(0.35, 1.0, smoothstep(0.4, 0.95, tex.a));

  // halftone dot matrix: dot size follows brightness; dots grow in right behind the scan front
  float rev = 1.0 - smoothstep(uScan - 0.28, uScan, t);
  vec2 g = vUv * vec2(uAspect, 1.0) * uCells;
  vec2 cuv = (floor(g) + 0.5) / (vec2(uAspect, 1.0) * uCells);
  vec4 ct = texture2D(uMap, cuv);
  float cl = pow(clamp(luma(ct.rgb) * 1.9, 0.0, 1.0), 0.7);
  float rad = mix(0.1, 0.58, cl) * rev;
  float dotm = smoothstep(rad, rad - 0.17, length(fract(g) - 0.5)) * smoothstep(0.45, 0.9, ct.a) * step(0.001, rev);
  vec3 hcol = mix(vec3(0.5, 0.58, 0.44), vec3(0.94, 1.0, 0.8), cl);

  // the cursor opens a soft, feathered window onto the real photograph
  float lens = smoothstep(0.19, 0.0, length((vUv - 0.5) * vec2(uAspect, 1.0) - uPointer)) * 0.9 * rev * smoothstep(0.6, 1.0, uScan);
  float cover = lens + (1.0 - lens) * dotm;
  vec3 col = mix(hcol, photo, lens / max(cover, 0.001));

  // one soft line travels with the scan front during the intro only
  float line = smoothstep(0.014, 0.0, abs(t - uScan + 0.005)) * step(uScan, 1.02) * 0.55;
  col += vec3(0.78, 1.0, 0.24) * line;
  gl_FragColor = vec4(col, aMask * max(min(cover, 1.0), line) * uOpacity);
}`;
