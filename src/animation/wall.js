// Procedural concrete: a seamless 512px tile (periodic fbm value noise + pores + hairline cracks)
// generated once at start-up and applied to the page as the wall every scene is painted on.
const S = 512;
const hash = (i, j, s) => {
  let h = (i * 374761393 + j * 668265263 + s * 1274126177) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967295;
};
const noise = (x, y, per, s) => {
  const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi;
  const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf);
  const a = hash(xi % per, yi % per, s), b = hash((xi + 1) % per, yi % per, s);
  const c = hash(xi % per, (yi + 1) % per, s), d = hash((xi + 1) % per, (yi + 1) % per, s);
  return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v;
};

export let wallTile = null;

export function applyWall() {
  try {
    const c = document.createElement('canvas');
    c.width = c.height = S;
    const ctx = c.getContext('2d');
    // the noise is generated on a half-resolution grid (4x fewer evaluations at start-up) and smoothly upscaled
    const h = S / 2, half = document.createElement('canvas'); half.width = half.height = h;
    const hx = half.getContext('2d'), img = hx.createImageData(h, h);
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < h; x++) {
        let v = 0, amp = 0.55, per = 4;
        for (let o = 0; o < 5; o++) { v += amp * noise((x / h) * per, (y / h) * per, per, o); per *= 2; amp *= 0.5; }
        const grain = hash(x, y, 77) - 0.5;
        const base = 30 + v * 30 + grain * 12;
        const i = (y * h + x) * 4;
        img.data[i] = base + 3; img.data[i + 1] = base + 1; img.data[i + 2] = base - 3; img.data[i + 3] = 255;
      }
    }
    hx.putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(half, 0, 0, S, S);
    // pores
    for (let k = 0; k < 520; k++) {
      const x = hash(k, 1, 5) * S, y = hash(k, 2, 5) * S, r = 0.6 + hash(k, 3, 5) * 1.6;
      ctx.fillStyle = `rgba(8,8,7,${0.25 + hash(k, 4, 5) * 0.35})`;
      ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill();
    }
    // hairline cracks
    ctx.strokeStyle = 'rgba(10,9,8,0.35)'; ctx.lineWidth = 0.8;
    for (let k = 0; k < 4; k++) {
      let x = hash(k, 9, 6) * S, y = hash(k, 10, 6) * S;
      ctx.beginPath(); ctx.moveTo(x, y);
      for (let j = 0; j < 14; j++) { x += (hash(k, j, 7) - 0.45) * 38; y += (hash(k, j, 8) - 0.35) * 30; ctx.lineTo(x, y); }
      ctx.stroke();
    }
    wallTile = c;
    document.documentElement.style.setProperty('--wall', `url(${c.toDataURL('image/jpeg', 0.82)})`);
  } catch { /* CSS fallback colour is used */ }
}
