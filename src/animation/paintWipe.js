import { gsap } from './gsap';

let THREE = null;
let loading = null;
// Three.js is only needed for the wipe, so it loads on first use (and is prefetched when the browser is idle).
export const loadThree = () => (loading ||= import('three').then((m) => { THREE = m; return m; }));

// Liquid paint wipe: a full-screen fragment shader. Three layers of paint (red, yellow, black) flood the
// screen from the bottom with a noise-warped, grainy "overspray" edge, hold while the page jumps unseen
// underneath, then peel away upward. Rendered on demand only while the wipe is running.
const VERT = 'void main(){ gl_Position = vec4(position.xy, 0.0, 1.0); }';
const FRAG = /* glsl */ `
precision highp float;
uniform float uT; uniform vec2 uRes; uniform float uTime;
float h(vec2 p){ return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float n(vec2 p){ vec2 i = floor(p), f = fract(p); f = f*f*(3.0-2.0*f);
  return mix(mix(h(i), h(i+vec2(1,0)), f.x), mix(h(i+vec2(0,1)), h(i+vec2(1,1)), f.x), f.y); }
float fbm(vec2 p){ float v = 0.0, a = 0.5; for (int i = 0; i < 4; i++){ v += a * n(p); p *= 2.03; a *= 0.5; } return v; }
void main(){
  vec2 uv = gl_FragCoord.xy / uRes;
  float asp = uRes.x / uRes.y;
  float base = uv.y * 0.78 + fbm(vec2(uv.x * asp, uv.y) * 3.2 + uTime * 0.2) * 0.5;
  float grain = h(gl_FragCoord.xy * 0.8);
  vec3 cols[3]; cols[0] = vec3(1.0, 0.231, 0.114); cols[1] = vec3(1.0, 0.839, 0.039); cols[2] = vec3(0.051, 0.047, 0.043);
  vec4 col = vec4(0.0);
  for (int i = 0; i < 3; i++){
    float tin = clamp(uT - float(i) * 0.13, 0.0, 2.0);
    float val = tin < 1.0 ? (tin * 1.55 - 0.12) - base : base - ((tin - 1.0) * 1.55 - 0.12);
    float a = smoothstep(0.0, 0.09, val);
    float vis = step(grain * 0.55, a) * step(0.001, tin);
    if (tin >= 2.0) vis = 0.0;
    col = mix(col, vec4(cols[i], 1.0), vis);
  }
  gl_FragColor = col;
}`;

let st = null;

function build() {
  const canvas = document.createElement('canvas');
  canvas.className = 'paintwipe';
  const label = document.createElement('div');
  label.className = 'paintwipe__label';
  const word = document.createElement('span');
  label.appendChild(word);
  document.body.append(canvas, label);
  let renderer = null;
  try {
    renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false, premultipliedAlpha: false });
  } catch { renderer = null; }
  const o = { canvas, label, word, renderer };
  if (renderer) {
    renderer.setClearColor(0x000000, 0);
    o.scene = new THREE.Scene();
    o.cam = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    o.mat = new THREE.ShaderMaterial({ vertexShader: VERT, fragmentShader: FRAG, transparent: true, uniforms: { uT: { value: 0 }, uRes: { value: new THREE.Vector2(1, 1) }, uTime: { value: 0 } } });
    o.scene.add(new THREE.Mesh(new THREE.PlaneGeometry(2, 2), o.mat));
  }
  return o;
}

function size(o) {
  const dpr = Math.min(window.devicePixelRatio || 1, 1.25);
  const w = window.innerWidth, h = window.innerHeight;
  o.renderer.setPixelRatio(dpr);
  o.renderer.setSize(w, h, false);
  o.canvas.style.width = '100%'; o.canvas.style.height = '100%';
  o.mat.uniforms.uRes.value.set(w * dpr, h * dpr);
}

/** run('Lab', cover) plays the wipe; `cover` is called while the screen is fully covered. */
export async function runWipe(text, cover) {
  await loadThree();
  return new Promise((resolve) => {
    if (!st) st = build();
    const o = st;
    o.word.textContent = text;
    gsap.set(o.canvas, { display: 'block' });
    const v = { t: 0 };
    const draw = () => { if (o.renderer) { o.mat.uniforms.uT.value = v.t; o.mat.uniforms.uTime.value = performance.now() / 1000; o.renderer.render(o.scene, o.cam); } };
    if (o.renderer) size(o);
    const fallback = !o.renderer;
    if (fallback) gsap.set(o.canvas, { background: '#0d0c0b', opacity: 0 });
    gsap.timeline({ onComplete: () => { gsap.set(o.canvas, { display: 'none' }); gsap.set(o.label, { autoAlpha: 0 }); resolve(); } })
      .set(o.label, { autoAlpha: 1 })
      .to(v, { t: 1, duration: 1.0, ease: 'power2.inOut', onUpdate: () => (fallback ? gsap.set(o.canvas, { opacity: v.t }) : draw()) })
      .fromTo(o.word, { yPercent: 115, rotate: 4 }, { yPercent: 0, rotate: -3, duration: 0.7, ease: 'expo.out' }, '-=0.45')
      .call(cover)
      .to(o.word, { yPercent: -115, duration: 0.5, ease: 'expo.in' }, '+=0.25')
      .to(v, { t: 2, duration: 1.0, ease: 'power2.inOut', onUpdate: () => (fallback ? gsap.set(o.canvas, { opacity: 2 - v.t }) : draw()) }, '-=0.3');
  });
}
