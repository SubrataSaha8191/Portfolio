// Aerosol deposition: a dab scatters tiny paint specks with a gaussian falloff, so density is high at
// the centre and speckled at the edges, like real overspray.
export function gauss() {
  let u = 0, v = 0;
  while (!u) u = Math.random();
  while (!v) v = Math.random();
  return Math.sqrt(-2 * Math.log(u)) * Math.cos(6.2831853 * v);
}

export function dab(ctx, x, y, r, color, n = 40, alpha = 0.5, size = [0.8, 2.2]) {
  ctx.fillStyle = color;
  ctx.globalAlpha = alpha;
  for (let i = 0; i < n; i++) {
    const a = Math.random() * 6.2831853;
    const d = Math.abs(gauss()) * r * 0.5;
    const s = size[0] + Math.random() * (size[1] - size[0]);
    ctx.fillRect(x + Math.cos(a) * d, y + Math.sin(a) * d, s, s);
  }
  ctx.globalAlpha = 1;
}

export const PAINT = { red: '#ff3b1d', yellow: '#ffd60a', cyan: '#11b5e4', pink: '#ff4fa3', ink: '#0d0c0b', paper: '#efe8d6' };
