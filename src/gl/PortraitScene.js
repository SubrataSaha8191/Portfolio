import * as THREE from 'three';
import { pointsVertex, pointsFragment, planeVertex, planeFragment } from './shaders';
import { motion } from '../animation/state';

const lerp = (a, b, t) => a + (b - a) * t;

/**
 * One photograph, three states:
 *   1. the photo itself (textured plane, below the scan line)
 *   2. a relief point-cloud sampled from that photo (above the scan line)
 *   3. a layered "neural field" the same points disperse into on scroll
 * and back to 1/2 again for the contact scene.
 */
export default class PortraitScene {
  constructor(canvas, { src, reduced = false, mobile = false }) {
    this.canvas = canvas;
    this.reduced = reduced;
    this.mobile = mobile;
    this.src = src;
    this.visible = true;
    this.running = false;
    this.pr = Math.min(window.devicePixelRatio || 1, mobile ? 1.5 : 1.75);
    this.maxPR = this.pr;
    this.ft = 16;
    this.slow = 0;
    this.keep = 1;
    this.intro = { v: reduced ? 1 : 0 };
    this.pointerLocal = new THREE.Vector2();
    this.smoothPointer = { x: 0, y: 0 };

    this.renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
    this.renderer.setClearColor(0x000000, 0);
    this.renderer.setPixelRatio(this.pr);

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, 1, 0.1, 50);
    this.camera.position.z = 5;
    this.group = new THREE.Group();
    this.scene.add(this.group);

    this.uniforms = {
      uTime: { value: 0 },
      uScan: { value: reduced ? 1.2 : 0 },
      uDisperse: { value: 0 },
      uSettle: { value: reduced ? 1 : 0 },
      uPulse: { value: -1 },
      uSize: { value: 1 },
      uPR: { value: this.pr },
      uFieldW: { value: 3 },
      uFieldH: { value: 2 },
      uMotion: { value: reduced ? 0 : 1 },
      uKeep: { value: 1 },
      uPointer: { value: this.pointerLocal },
    };
    this.planeUniforms = { uMap: { value: null }, uScan: this.uniforms.uScan, uOpacity: { value: 1 }, uSettle: this.uniforms.uSettle, uPulse: this.uniforms.uPulse, uAspect: { value: 0.85 }, uCells: { value: mobile ? 100 : 150 }, uPointer: this.uniforms.uPointer };
  }

  async load() {
    const img = new Image();
    img.decoding = 'async';
    img.src = this.src;
    await img.decode();
    const aspect = img.naturalWidth / img.naturalHeight;
    this.aspect = aspect;
    this.planeUniforms.uAspect.value = aspect;

    // sample the photo into a point grid (CPU, once)
    const cols = this.mobile ? 150 : 230;
    const rows = Math.round(cols / aspect);
    const c = document.createElement('canvas');
    c.width = cols;
    c.height = rows;
    const ctx = c.getContext('2d', { willReadFrequently: true });
    ctx.drawImage(img, 0, 0, cols, rows);
    const data = ctx.getImageData(0, 0, cols, rows).data;
    const pts = [];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (data[i + 3] < 140) continue;
        const r = data[i] / 255, g = data[i + 1] / 255, b = data[i + 2] / 255;
        pts.push([x, y, r, g, b, 0.2126 * r + 0.7152 * g + 0.0722 * b]);
      }
    }
    for (let i = pts.length - 1; i > 0; i--) {
      const j = (Math.random() * (i + 1)) | 0;
      [pts[i], pts[j]] = [pts[j], pts[i]];
    }
    const n = pts.length;
    this.count = n;
    const pos = new Float32Array(n * 3), col = new Float32Array(n * 3), seed = new Float32Array(n * 3), lum = new Float32Array(n);
    pts.forEach((p, i) => {
      pos[i * 3] = ((p[0] + 0.5) / cols - 0.5) * aspect;
      pos[i * 3 + 1] = 0.5 - (p[1] + 0.5) / rows;
      pos[i * 3 + 2] = 0;
      col.set([p[2], p[3], p[4]], i * 3);
      seed.set([Math.random(), Math.random(), Math.random()], i * 3);
      lum[i] = p[5];
    });
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    geo.setAttribute('aColor', new THREE.BufferAttribute(col, 3));
    geo.setAttribute('aSeed', new THREE.BufferAttribute(seed, 3));
    geo.setAttribute('aLum', new THREE.BufferAttribute(lum, 1));
    geo.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 6);
    this.pointsMat = new THREE.ShaderMaterial({
      vertexShader: pointsVertex,
      fragmentShader: pointsFragment,
      uniforms: this.uniforms,
      transparent: true,
      depthWrite: false,
    });
    this.points = new THREE.Points(geo, this.pointsMat);
    this.points.frustumCulled = false;

    const tex = new THREE.Texture(img);
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.minFilter = THREE.LinearFilter;
    tex.generateMipmaps = false;
    tex.needsUpdate = true;
    this.planeUniforms.uMap.value = tex;
    this.plane = new THREE.Mesh(
      new THREE.PlaneGeometry(aspect, 1),
      new THREE.ShaderMaterial({ vertexShader: planeVertex, fragmentShader: planeFragment, uniforms: this.planeUniforms, transparent: true, depthWrite: false })
    );
    this.plane.position.z = -0.02;
    this.group.add(this.plane, this.points);
    this.resize();
    this.render(0);
    return n;
  }

  resize() {
    const w = this.canvas.clientWidth || window.innerWidth;
    const h = this.canvas.clientHeight || window.innerHeight;
    this.w = w;
    this.h = h;
    this.renderer.setSize(w, h, false);
    this.camera.aspect = w / h;
    this.camera.updateProjectionMatrix();
    const vh = 2 * this.camera.position.z * Math.tan(THREE.MathUtils.degToRad(this.camera.fov / 2));
    const vw = vh * this.camera.aspect;
    this.vw = vw;
    this.vh = vh;
    const portrait = w < 820;
    const aspect = this.aspect || 0.85;
    // portrait height in world units
    this.S = portrait ? Math.min(vh * 0.36, (vw * 0.78) / aspect) : vh * 0.72;
    this.heroX = portrait ? 0 : vw * 0.27;
    this.heroY = portrait ? vh * 0.2 : -vh * 0.02;
    this.contactX = portrait ? 0 : -vw * 0.2;
    this.group.scale.setScalar(this.S);
    this.uniforms.uFieldW.value = vw / this.S;
    this.uniforms.uFieldH.value = vh / this.S;
    // size of one sample cell in CSS px at rest
    const cellPx = ((this.S * h) / vh) / Math.round((this.mobile ? 150 : 230) / aspect);
    this.uniforms.uSize.value = cellPx * (portrait ? 1.2 : 1.4);
  }

  setVisible(v) {
    this.visible = v;
  }

  start() {
    if (this.running) return;
    this.running = true;
    this.last = performance.now();
    this.raf = requestAnimationFrame(this.loop);
  }

  stop() {
    this.running = false;
    cancelAnimationFrame(this.raf);
  }

  loop = (now) => {
    if (!this.running) return;
    this.raf = requestAnimationFrame(this.loop);
    if (!this.visible || document.hidden) {
      this.last = now;
      return;
    }
    // ambient field phase (between hero and contact): half-rate, nothing reads as slower
    if (motion.disperse > 0.97 && motion.contact < 0.05) {
      this.skip = !this.skip;
      if (this.skip) return;
    }
    const dt = Math.min(now - this.last, 100);
    this.last = now;
    this.adapt(dt);
    this.render(dt);
  };

  // Dynamic resolution + density: if frames run slow for ~1s, shed pixel ratio, then points.
  adapt(dt) {
    this.ft = lerp(this.ft, dt, 0.05);
    if (this.ft > 26) this.slow += dt;
    else this.slow = Math.max(0, this.slow - dt * 0.5);
    if (this.slow > 1200) {
      this.slow = 0;
      if (this.pr > 1) {
        this.pr = Math.max(1, this.pr - 0.25);
        this.renderer.setPixelRatio(this.pr);
        this.uniforms.uPR.value = this.pr;
        this.renderer.setSize(this.w, this.h, false);
      } else if (this.keep > 0.5) {
        this.keep -= 0.15;
        this.uniforms.uKeep.value = this.keep;
      }
    }
  }

  render(dt) {
    const u = this.uniforms;
    u.uTime.value += dt * 0.001;
    u.uDisperse.value = lerp(u.uDisperse.value, motion.disperse, this.reduced ? 1 : 0.12);

    const sp = this.smoothPointer;
    sp.x = lerp(sp.x, this.reduced ? 0 : motion.pointer.x, 0.06);
    sp.y = lerp(sp.y, this.reduced ? 0 : motion.pointer.y, 0.06);
    const d = u.uDisperse.value;
    const cm = motion.contact;
    const x = lerp(this.heroX, this.contactX, cm) * (1 - d);
    const y = this.heroY * (1 - d);
    // cinematic push-in: the portrait settles from slightly large and low
    const e = this.intro.v;
    this.group.scale.setScalar(this.S * (1.14 - 0.14 * e));
    this.group.position.set(x, y - (1 - e) * 0.12, 0);
    this.group.rotation.y = sp.x * 0.2 * (1 - d * 0.4) + d * u.uTime.value * 0.02 * (this.reduced ? 0 : 1);
    this.group.rotation.x = -sp.y * 0.07;

    this.pointerLocal.set((sp.x * this.vw * 0.5 - x) / this.S, (sp.y * this.vh * 0.5 - y) / this.S);
    this.planeUniforms.uOpacity.value = 1 - smooth(0, 0.35, d);
    this.renderer.render(this.scene, this.camera);
  }

  dispose() {
    this.stop();
    this.scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) o.material.dispose();
    });
    if (this.planeUniforms.uMap.value) this.planeUniforms.uMap.value.dispose();
    this.renderer.dispose();
    this.renderer.forceContextLoss();
  }
}

function smooth(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}
