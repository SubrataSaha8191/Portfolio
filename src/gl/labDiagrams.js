// Illustrative 2D diagrams for the Lab section. They are storytelling, not live data.
// Each draw(ctx, w, h, t) paints with the shared palette; the caller handles cross-fades.
const INK = (a) => `rgba(236,232,220,${a})`;
const LIME = (a) => `rgba(198,255,61,${a})`;
const ORANGE = (a) => `rgba(255,106,40,${a})`;
const font = (ctx, s) => (ctx.font = `${s}px "JetBrains Mono", monospace`);

function box(ctx, x, y, w, h, label, hot, size = 11) {
  ctx.strokeStyle = hot ? LIME(0.95) : INK(0.35);
  ctx.fillStyle = hot ? LIME(0.1) : 'rgba(11,12,10,0.6)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.rect(x - w / 2, y - h / 2, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = hot ? LIME(1) : INK(0.8);
  font(ctx, size);
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(label, x, y);
}
const caption = (ctx, w, h, txt) => {
  ctx.fillStyle = INK(0.45);
  font(ctx, 10);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.fillText(txt, 0, h - 2);
};

export const diagrams = {
  // layered network with a signal travelling forward
  ml(ctx, w, h, t) {
    const L = [4, 6, 6, 3];
    const xs = L.map((_, i) => w * (0.1 + (0.8 * i) / (L.length - 1)));
    const pts = L.map((n, i) => Array.from({ length: n }, (_, j) => [xs[i], h * 0.1 + ((h * 0.7) * (j + 0.5)) / n]));
    const phase = (t * 0.7) % (L.length + 0.6);
    ctx.lineWidth = 1;
    pts.forEach((layer, i) => {
      if (i === L.length - 1) return;
      const on = Math.max(0, 1 - Math.abs(phase - (i + 0.5)) * 1.2);
      layer.forEach((a, ai) =>
        pts[i + 1].forEach((b, bi) => {
          ctx.strokeStyle = on > 0.05 && (ai + bi) % 2 === 0 ? LIME(0.1 + on * 0.45) : INK(0.1);
          ctx.beginPath(); ctx.moveTo(a[0], a[1]); ctx.lineTo(b[0], b[1]); ctx.stroke();
        })
      );
    });
    pts.forEach((layer, i) => {
      const on = Math.max(0, 1 - Math.abs(phase - i) * 1.4);
      layer.forEach(([x, y]) => {
        ctx.fillStyle = on > 0.05 ? LIME(0.35 + on * 0.65) : INK(0.65);
        ctx.beginPath(); ctx.arc(x, y, 4 + on * 3, 0, 7); ctx.fill();
      });
    });
    font(ctx, 10); ctx.textAlign = 'center'; ctx.fillStyle = INK(0.5);
    ['input', 'hidden', 'hidden', 'output'].forEach((s, i) => ctx.fillText(s, xs[i], h * 0.93));
    caption(ctx, w, h, 'forward pass: illustrative');
  },
  // attention arcs over tokens + convolution kernel over a pixel grid
  nlpcv(ctx, w, h, t) {
    const toks = ['the', 'model', 'reads', 'this', 'text'];
    const tw = w / toks.length;
    toks.forEach((s, i) => box(ctx, tw * (i + 0.5), h * 0.3, tw - 8, 26, s, i === Math.floor((t * 0.8) % toks.length)));
    const q = Math.floor((t * 0.8) % toks.length);
    toks.forEach((_, j) => {
      if (j === q) return;
      const a = 0.12 + 0.5 * Math.abs(Math.sin(t * 0.9 + j * 1.7 + q));
      ctx.strokeStyle = LIME(a);
      ctx.beginPath();
      const x1 = tw * (q + 0.5), x2 = tw * (j + 0.5);
      ctx.moveTo(x1, h * 0.3 - 13);
      ctx.bezierCurveTo(x1, h * 0.3 - 70, x2, h * 0.3 - 70, x2, h * 0.3 - 13);
      ctx.stroke();
    });
    const cols = 12, rows = 5, cs = Math.min(w / cols, (h * 0.4) / rows), ox = (w - cs * cols) / 2, oy = h * 0.52;
    for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
      const v = 0.5 + 0.5 * Math.sin(c * 0.9 + r * 1.3);
      ctx.fillStyle = INK(0.05 + v * 0.22);
      ctx.fillRect(ox + c * cs + 1, oy + r * cs + 1, cs - 2, cs - 2);
    }
    const kx = Math.floor((t * 1.6) % (cols - 2)), ky = Math.floor(((t * 1.6) / (cols - 2)) % (rows - 2));
    ctx.strokeStyle = LIME(0.95); ctx.lineWidth = 2;
    ctx.strokeRect(ox + kx * cs, oy + ky * cs, cs * 3, cs * 3); ctx.lineWidth = 1;
    caption(ctx, w, h, 'attention · convolution: illustrative');
  },
  // plan → act → observe → retrieve loop with a fallback path
  agents(ctx, w, h, t) {
    const cx = w / 2, cy = h * 0.46, R = Math.min(w, h) * 0.32;
    const names = ['PLAN', 'TOOL CALL', 'OBSERVE', 'RETRIEVE'];
    const pos = names.map((_, i) => [cx + Math.cos(i * Math.PI / 2 - Math.PI / 2) * R * 1.35, cy + Math.sin(i * Math.PI / 2 - Math.PI / 2) * R]);
    ctx.strokeStyle = INK(0.25); ctx.setLineDash([4, 5]);
    ctx.beginPath(); ctx.ellipse(cx, cy, R * 1.35, R, 0, 0, 7); ctx.stroke(); ctx.setLineDash([]);
    const a = t * 0.8 - Math.PI / 2;
    const hot = Math.floor((((t * 0.8) % (Math.PI * 2)) / (Math.PI * 2)) * 4 + 0.5) % 4;
    ctx.fillStyle = LIME(1); ctx.beginPath(); ctx.arc(cx + Math.cos(a) * R * 1.35, cy + Math.sin(a) * R, 5, 0, 7); ctx.fill();
    pos.forEach((p, i) => box(ctx, p[0], p[1], 92, 28, names[i], i === hot));
    ctx.strokeStyle = LIME(0.5); ctx.beginPath(); ctx.arc(cx, cy, 26, 0, 7); ctx.stroke();
    ctx.fillStyle = LIME(1); font(ctx, 11); ctx.textAlign = 'center'; ctx.fillText('LLM', cx, cy + 1);
    box(ctx, cx, h * 0.93, 130, 22, 'FALLBACK: rules', false, 10);
    ctx.strokeStyle = ORANGE(0.5); ctx.setLineDash([3, 4]); ctx.beginPath(); ctx.moveTo(cx, cy + 28); ctx.lineTo(cx, h * 0.93 - 11); ctx.stroke(); ctx.setLineDash([]);
    caption(ctx, w, h, 'agent loop: illustrative');
  },
  // request moving down a service stack on top of the OS
  systems(ctx, w, h, t) {
    const labels = ['CLIENT', 'API', 'SERVICE', 'DATA'];
    const y = (i) => h * (0.13 + i * 0.2);
    const phase = (t * 0.9) % (labels.length + 0.4);
    labels.forEach((s, i) => {
      if (i) { ctx.strokeStyle = INK(0.3); ctx.beginPath(); ctx.moveTo(w / 2, y(i - 1) + 15); ctx.lineTo(w / 2, y(i) - 15); ctx.stroke(); }
      box(ctx, w / 2, y(i), w * 0.46, 30, s, Math.abs(phase - i) < 0.5);
    });
    const py = y(0) + Math.min(phase, 3) * (y(1) - y(0));
    ctx.fillStyle = LIME(1); ctx.beginPath(); ctx.arc(w / 2, py, 4, 0, 7); ctx.fill();
    ctx.fillStyle = INK(0.07); ctx.strokeStyle = INK(0.3);
    ctx.fillRect(w * 0.1, h * 0.85, w * 0.8, 26); ctx.strokeRect(w * 0.1, h * 0.85, w * 0.8, 26);
    ctx.fillStyle = INK(0.7); font(ctx, 10); ctx.textAlign = 'center'; ctx.fillText('LINUX · systemd · PAM · sockets', w / 2, h * 0.85 + 14);
    caption(ctx, w, h, 'request path: illustrative');
  },
  // stream of tokens meeting a three-way classifier gate
  security(ctx, w, h, t) {
    const gx = w * 0.46;
    ctx.strokeStyle = INK(0.5); ctx.beginPath(); ctx.moveTo(gx, h * 0.1); ctx.lineTo(gx, h * 0.8); ctx.stroke();
    font(ctx, 10); ctx.textAlign = 'center'; ctx.fillStyle = INK(0.6); ctx.fillText('CLASSIFIER', gx, h * 0.07);
    const lanes = [['SAFE', LIME], ['SUSPICIOUS', ORANGE], ['MALICIOUS', (a) => `rgba(255,70,90,${a})`]];
    lanes.forEach(([label, c], i) => {
      const y = h * (0.22 + i * 0.25);
      ctx.strokeStyle = c(0.25); ctx.beginPath(); ctx.moveTo(gx, y); ctx.lineTo(w, y); ctx.stroke();
      ctx.fillStyle = c(0.9); ctx.textAlign = 'right'; ctx.fillText(label, w - 2, y - 8);
      for (let k = 0; k < 4; k++) {
        const x = gx + ((t * 60 + k * (w - gx) / 4 + i * 30) % (w - gx - 20));
        ctx.fillStyle = c(0.9); ctx.fillRect(x, y - 3, 14, 6);
      }
    });
    for (let k = 0; k < 6; k++) {
      const x = ((t * 70 + k * gx / 6) % gx);
      const y = h * (0.2 + ((k * 37) % 55) / 100);
      ctx.fillStyle = INK(0.55); ctx.fillRect(x - 12, y - 3, 12, 6);
    }
    ctx.fillStyle = INK(0.5); ctx.textAlign = 'left'; ctx.fillText('inputs', 0, h * 0.07);
    caption(ctx, w, h, 'SAFE / SUSPICIOUS / MALICIOUS: illustrative');
  },
  // branching commit graph
  oss(ctx, w, h, t) {
    const n = 16, step = w / (n + 1), main = h * 0.5;
    const grow = Math.min(n, Math.floor(((t * 0.9) % (n + 6))));
    ctx.lineWidth = 1.5;
    const branches = [[2, 7, -1], [5, 12, 1], [9, 14, -1]];
    ctx.strokeStyle = INK(0.45);
    ctx.beginPath(); ctx.moveTo(step, main); ctx.lineTo(step * (Math.min(grow, n - 1) + 1), main); ctx.stroke();
    branches.forEach(([a, b, d]) => {
      if (grow < a) return;
      const e = Math.min(grow, b), off = d * h * 0.2;
      ctx.strokeStyle = LIME(0.7);
      ctx.beginPath(); ctx.moveTo(step * (a + 1), main); ctx.lineTo(step * (a + 1.8), main + off); ctx.lineTo(step * (e + 0.2), main + off);
      if (grow >= b) ctx.lineTo(step * (b + 1), main);
      ctx.stroke();
      for (let k = a + 2; k <= e; k++) { ctx.fillStyle = LIME(0.9); ctx.beginPath(); ctx.arc(step * (k + 0.4), main + off, 3.5, 0, 7); ctx.fill(); }
    });
    for (let k = 0; k <= Math.min(grow, n - 1); k++) { ctx.fillStyle = INK(0.9); ctx.beginPath(); ctx.arc(step * (k + 1), main, 4.5, 0, 7); ctx.fill(); }
    ctx.lineWidth = 1;
    ctx.fillStyle = INK(0.5); font(ctx, 10); ctx.textAlign = 'left'; ctx.fillText('main', 0, main - 12);
    caption(ctx, w, h, 'git log --graph: illustrative');
  },
};
