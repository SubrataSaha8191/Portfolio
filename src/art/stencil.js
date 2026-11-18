// Turns the real cutout photograph into a layered street-art stencil: luminance is blurred a touch,
// split at the portrait's own quartiles into four paint tones, and given a hard black contour,
// so the face stays recognisable (tones follow the actual light on the actual face).
const TONES = [[13, 12, 11], [255, 59, 29], [239, 232, 214], [255, 247, 214]];

const cache = new Map();
export function buildStencil(src, W, H) {
  const k = `${src}|${W}|${H}`;
  if (!cache.has(k)) cache.set(k, build(src, W, H));
  return cache.get(k);
}

async function build(src, W, H) {
  const img = new Image();
  img.src = src;
  await img.decode();
  const photo = document.createElement('canvas');
  photo.width = W; photo.height = H;
  const pc = photo.getContext('2d', { willReadFrequently: true });
  pc.drawImage(img, 0, 0, W, H);
  const data = pc.getImageData(0, 0, W, H).data;

  const L = new Float32Array(W * H);
  for (let i = 0; i < W * H; i++) L[i] = (0.2126 * data[i * 4] + 0.7152 * data[i * 4 + 1] + 0.0722 * data[i * 4 + 2]) / 255;
  // 5x5 box blur (two passes) keeps tones from speckling
  const B = new Float32Array(W * H);
  // separable 5x5 box blur: horizontal then vertical (same result as the 2D box, 10 reads per pixel instead of 25)
  const blur = (a, b) => {
    const t = new Float32Array(W * H);
    for (let y = 0; y < H; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x; t[i] = (a[i - 2] + a[i - 1] + a[i] + a[i + 1] + a[i + 2]) / 5; }
    for (let y = 2; y < H - 2; y++) for (let x = 2; x < W - 2; x++) { const i = y * W + x; b[i] = (t[i - 2 * W] + t[i - W] + t[i] + t[i + W] + t[i + 2 * W]) / 5; }
  };
  blur(L, B);

  const sample = [];
  for (let i = 0; i < W * H; i += 5) if (data[i * 4 + 3] > 200) sample.push(B[i]);
  sample.sort((a, b) => a - b);
  const q = (p) => sample[Math.floor(sample.length * p)] || 0.5;
  const t1 = q(0.24), t2 = q(0.52), t3 = q(0.8);

  const inside = new Uint8Array(W * H);
  for (let i = 0; i < W * H; i++) inside[i] = data[i * 4 + 3] > 140 ? 1 : 0;

  const out = new ImageData(W, H);
  const R = 3;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const i = y * W + x;
      if (!inside[i]) continue;
      let tone;
      const edge = x < R || y < R || x >= W - R || y >= H - R || !inside[i - R] || !inside[i + R] || !inside[i - R * W] || !inside[i + R * W];
      if (edge) tone = 0;
      else { const l = B[i]; tone = l < t1 ? 0 : l < t2 ? 1 : l < t3 ? 2 : 3; }
      const c = TONES[tone];
      out.data[i * 4] = c[0]; out.data[i * 4 + 1] = c[1]; out.data[i * 4 + 2] = c[2]; out.data[i * 4 + 3] = 255;
    }
  }
  const stencil = document.createElement('canvas');
  stencil.width = W; stencil.height = H;
  stencil.getContext('2d').putImageData(out, 0, 0);
  return { stencil, photo };
}
