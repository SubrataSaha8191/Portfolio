// Procedural geometry for the opening artwork. Deterministic (seeded), computed once at
// module load. Everything lives in a 1000x1000 viewBox centred on (500,500).
const C = 500;
const f = (n) => +n.toFixed(1);
const polar = (r, a) => [f(C + r * Math.cos(a)), f(C + r * Math.sin(a))];
const rad = (d) => (d * Math.PI) / 180;

function rng(seed) {
  let t = seed;
  return () => {
    t = (t + 0x6d2b79f5) | 0;
    let x = Math.imul(t ^ (t >>> 15), 1 | t);
    x = (x + Math.imul(x ^ (x >>> 7), 61 | x)) ^ x;
    return ((x ^ (x >>> 14)) >>> 0) / 4294967296;
  };
}
const R = rng(2026);

// topographic contour rings: smooth organic closed curves
export const contours = [64, 98, 138, 182, 230, 284, 340, 398, 452].map((base, i) => {
  const p = [R() * 6, R() * 6, R() * 6];
  const k = 0.035 + i * 0.006;
  const pts = [];
  for (let n = 0; n < 96; n++) {
    const a = (n / 96) * Math.PI * 2;
    const r = base * (1 + k * Math.sin(3 * a + p[0]) + k * 0.7 * Math.sin(5 * a + p[1]) + k * 0.4 * Math.sin(8 * a + p[2]));
    pts.push(polar(r, a).join(' '));
  }
  return 'M' + pts.join('L') + 'Z';
});

// concentric construction circles
export const rings = [60, 118, 200, 290, 382];
// vesica: two offset circles whose intersection frames the lens
export const vesica = [[392, 500, 190], [608, 500, 190]];

// hypotrochoid / rose curve, the "parametric" layer
export const rose = (() => {
  const pts = [];
  for (let n = 0; n <= 260; n++) {
    const a = (n / 260) * Math.PI * 6;
    const r = 318 * Math.cos((5 / 3) * a);
    pts.push(polar(r, a).join(' '));
  }
  return 'M' + pts.join('L');
})();

// tick ring
export const ticks = (() => {
  let d = '';
  for (let i = 0; i < 72; i++) {
    const a = rad(i * 5);
    const [x1, y1] = polar(412, a);
    const [x2, y2] = polar(i % 6 === 0 ? 440 : 424, a);
    d += `M${x1} ${y1}L${x2} ${y2}`;
  }
  return d;
})();

// axes drawn outward from the spark
export const axes = ['M500 500H1500', 'M500 500H-500', 'M500 500V1500', 'M500 500V-500'];
// diagonal construction lines
export const diagonals = [30, 60, 120, 150].map((d) => {
  const a = rad(d);
  return `M${f(C - Math.cos(a) * 900)} ${f(C - Math.sin(a) * 900)}L${f(C + Math.cos(a) * 900)} ${f(C + Math.sin(a) * 900)}`;
});

// neural lattice (asymmetric: 5-7-5 on the left, 4-6-4 on the right)
function lattice(xs, counts) {
  const cols = counts.map((n, i) =>
    Array.from({ length: n }, (_, j) => [xs[i], f(500 - 215 + ((430 * (j + 0.5)) / n) + (i % 2 ? 14 : -10))])
  );
  const edges = [];
  for (let i = 0; i < cols.length - 1; i++) {
    let d = '';
    cols[i].forEach((a) => cols[i + 1].forEach((b) => (d += `M${a[0]} ${a[1]}L${b[0]} ${b[1]}`)));
    edges.push(d);
  }
  return { cols, edges };
}
export const left = lattice([70, 150, 230], [5, 7, 5]);
export const right = lattice([770, 850, 930], [4, 6, 4]);
export const nodes = [...left.cols.flat(), ...right.cols.flat()];

// bold structural arcs
const arc = (r, a0, a1) => {
  const [x0, y0] = polar(r, rad(a0));
  const [x1, y1] = polar(r, rad(a1));
  return `M${x0} ${y0}A${r} ${r} 0 ${a1 - a0 > 180 ? 1 : 0} 1 ${x1} ${y1}`;
};
export const boldArcs = [arc(290, -42, 38), arc(200, 138, 218), arc(382, 96, 150)];
export const limeArc = arc(334, 196, 262);

// small + marks at intersections
export const crosses = (() => {
  const pts = [polar(200, rad(30)), polar(290, rad(60)), polar(200, rad(150)), polar(290, rad(120)), polar(382, rad(0)), polar(382, rad(180)), polar(118, rad(45)), polar(118, rad(225))];
  return pts.map(([x, y]) => `M${x - 7} ${y}H${x + 7}M${x} ${y - 7}V${y + 7}`).join('');
})();

// signature: the lens. almond + iris + radial iris detail
export const almond = 'M280 500Q500 280 720 500Q500 720 280 500Z';
export const irisRay = (() => {
  let d = '';
  for (let i = 0; i < 28; i++) {
    const a = rad(i * (360 / 28));
    const [x1, y1] = polar(42, a);
    const [x2, y2] = polar(i % 2 ? 78 : 92, a);
    d += `M${x1} ${y1}L${x2} ${y2}`;
  }
  return d;
})();
