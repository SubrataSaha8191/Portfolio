import {  useRef } from 'react';
import { useQueuedLayout } from '../animation/setupQueue';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animation/gsap';
import { dab, PAINT } from '../animation/spray';
import CanIcon from './CanIcon';

const ROWS = [
  { t: 'MODELS', cap: 'trained, evaluated, judged', layer: 'poster', fill: '#efe8d6', shadow: '#ff3b1d', dust: [PAINT.red, PAINT.paper] },
  { t: 'SERVICES', cap: 'wrapped in APIs, agents and queues', layer: 'brick', fill: '#11b5e4', shadow: '#0d0c0b', dust: [PAINT.cyan, PAINT.ink] },
  { t: 'LINUX.', cap: 'down to PAM, systemd and sockets', layer: 'foundation', fill: '#ffd60a', shadow: '#ff3b1d', dust: [PAINT.yellow, PAINT.red] },
];
const PASSES = 4;
const PTS = 46;

/**
 * Cross-section of the wall: a poster layer, a brick layer and the foundation. While the section is pinned a spray can
 * WRITES each word onto its layer, live, in a serpentine, depositing a spray mask over solid lettering (so the word really
 * is painted in, stroke by stroke, and un-paints if you scroll back). Drips run down once a word is finished.
 */
export default function Giant() {
  const root = useRef(null);
  const cv = useRef(null);
  const over = useRef(null);
  const can = useRef(null);

  useQueuedLayout(() => {
    const scope = root.current;
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return undefined; }
    const view = cv.current, ov = over.current;
    const vctx = view.getContext('2d'), octx = ov.getContext('2d');
    const T = document.createElement('canvas'), M = document.createElement('canvas');
    const tctx = T.getContext('2d'), mctx = M.getContext('2d');
    let dprv = 1, lastL = [-1, -1, -1], W = 0, H = 0, rows = [], pts = [], drawn = 0, prog = 0, dirty = true, finalFilled = [false, false, false], dead = false;
    const dripEls = [];
    // a soft round brush: strokes accumulate smoothly instead of speckling
    const brush = document.createElement('canvas'); brush.width = brush.height = 96;
    { const bc = brush.getContext('2d'); const g = bc.createRadialGradient(48, 48, 0, 48, 48, 48); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(0.6, 'rgba(255,255,255,0.9)'); g.addColorStop(1, 'rgba(255,255,255,0)'); bc.fillStyle = g; bc.fillRect(0, 0, 96, 96); }

    const build = () => {
      const stage = scope.querySelector('.gs__stage');
      W = stage.clientWidth; H = stage.clientHeight;
      const dpr = Math.min(window.devicePixelRatio || 1, 1.25); dprv = dpr; lastL = [-1, -1, -1];
      [view, ov, T, M].forEach((c) => { c.width = Math.round(W * dpr); c.height = Math.round(H * dpr); });
      [vctx, octx, tctx, mctx].forEach((c) => c.setTransform(dpr, 0, 0, dpr, 0, 0));
      view.style.width = ov.style.width = `${W}px`; view.style.height = ov.style.height = `${H}px`;
      const band = H * 0.28;
      rows = ROWS.map((r, i) => {
        tctx.font = '100px Anton, Impact, sans-serif';
        const w100 = tctx.measureText(r.t).width;
        const size = Math.min((W * 0.9) / (w100 / 100), H * 0.29);
        const w = (w100 / 100) * size;
        const x = (W - w) / 2, cy = H * (0.22 + 0.28 * i);
        return { ...r, size, w, x, cy, top: cy - size * 0.5, h: size * 0.92 };
      });
      // text layer: solid, shadowed lettering (the paint that the sprayer will uncover)
      tctx.clearRect(0, 0, W, H);
      tctx.textBaseline = 'alphabetic'; tctx.lineJoin = 'round';
      rows.forEach((r) => {
        tctx.font = `${r.size}px Anton, Impact, sans-serif`;
        const by = r.cy + r.size * 0.4;
        tctx.fillStyle = r.shadow; tctx.fillText(r.t, r.x + r.size * 0.045, by + r.size * 0.045);
        tctx.lineWidth = r.size * 0.05; tctx.strokeStyle = '#0d0c0b'; tctx.strokeText(r.t, r.x, by);
        tctx.fillStyle = r.fill; tctx.fillText(r.t, r.x, by);
      });
      // sweep path: a serpentine over each word
      pts = rows.map((r) => {
        const out = [];
        for (let p = 0; p < PASSES; p++) {
          const y = r.top + ((p + 0.5) / PASSES) * r.h;
          for (let k = 0; k < PTS; k++) { const f = (k + 0.5) / PTS; out.push({ x: r.x - r.size * 0.1 + (p % 2 ? 1 - f : f) * (r.w + r.size * 0.2), y, rad: (r.h / PASSES) * 1.12 }); }
        }
        return out;
      });
      mctx.clearRect(0, 0, W, H); octx.clearRect(0, 0, W, H); drawn = 0; finalFilled = [false, false, false]; dirty = true;
      // drips: SVG-free, drawn from the word's lower edge, deterministic positions
      dripEls.length = 0;
      scope.querySelectorAll('.gs__drips').forEach((d, i) => {
        const r = rows[i];
        Object.assign(d.style, { left: `${r.x}px`, top: `${r.cy + r.size * 0.4}px`, width: `${r.w}px`, height: `${H * 0.11}px` });
        d.innerHTML = Array.from({ length: 9 }, (_, k) => { const x = (k + 0.5) / 9 * 100, l = 14 + ((k * 37 + i * 11) % 50); return `<i style="left:${x}%;height:${l}%;background:${r.shadow === '#0d0c0b' ? '#11b5e4' : r.shadow}"></i>`; }).join('');
        dripEls[i] = d;
      });
      scope.querySelectorAll('.gs__cap').forEach((c, i) => { const r = rows[i]; Object.assign(c.style, { left: `${Math.min(W - 230, r.x + r.w * 0.62)}px`, top: `${r.top - 6}px` }); });
    };

    const total = ROWS.length * PASSES * PTS;
    const paint = () => {
      // prog 0..3 (one unit per word); pts index
      const k = Math.min(total, Math.floor(prog * PASSES * PTS * 1.0));
      // only the band that actually changed gets re-composited (the rest of the canvas already holds the right pixels)
      let y0 = Infinity, y1 = -Infinity;
      if (k < drawn) { mctx.clearRect(0, 0, W, H); octx.clearRect(0, 0, W, H); drawn = 0; finalFilled = [false, false, false]; y0 = 0; y1 = H; }
      for (let j = drawn; j < k; j++) {
        const row = Math.floor(j / (PASSES * PTS)), idx = j % (PASSES * PTS), p = pts[row][idx];
        y0 = Math.min(y0, p.y - p.rad - 2); y1 = Math.max(y1, p.y + p.rad + 2);
        mctx.globalAlpha = 0.62; mctx.drawImage(brush, p.x - p.rad, p.y - p.rad, p.rad * 2, p.rad * 2); mctx.globalAlpha = 1;
        if (j % 2 === 0) dab(octx, p.x, p.y, p.rad * 2.4, ROWS[row].dust[(j >> 1) % 2], 5, 0.3, [1, 2.4]);
      }
      drawn = k;
      // guarantee full coverage once a word's last point has been reached
      rows.forEach((r, i) => { if (!finalFilled[i] && prog >= i + 0.995) { mctx.fillStyle = '#fff'; mctx.fillRect(r.x - r.size * 0.12, r.top - 14, r.w + r.size * 0.3, r.h + 40); finalFilled[i] = true; y0 = Math.min(y0, r.top - 16); y1 = Math.max(y1, r.top + r.h + 28); } });
      if (y1 > y0) {
        const by = Math.max(0, Math.floor(y0)), bh = Math.min(H, Math.ceil(y1)) - by;
        if (bh > 0) {
          const sy = Math.round(by * dprv), sh = Math.min(T.height - sy, Math.round(bh * dprv));
          // destination-in clears everything outside what it draws, so the whole operation is clipped to the band
          vctx.save();
          vctx.beginPath(); vctx.rect(0, by, W, bh); vctx.clip();
          vctx.clearRect(0, by, W, bh);
          vctx.drawImage(T, 0, sy, T.width, sh, 0, by, W, bh);
          vctx.globalCompositeOperation = 'destination-in';
          vctx.drawImage(M, 0, sy, M.width, sh, 0, by, W, bh);
          vctx.restore();
        }
      }
      dripEls.forEach((d, i) => { const l = Math.min(1, Math.max(0, (prog - (i + 0.9)) / 0.45)); if (l === lastL[i]) return; lastL[i] = l; Array.from(d.children).forEach((c, k) => { c.style.transform = `scaleY(${Math.min(1, Math.max(0, l * 1.4 - k * 0.04))})`; }); });
      // can follows the sweep
      const cur = Math.min(total - 1, Math.max(0, k - 1)), row = Math.floor(cur / (PASSES * PTS)), p = pts[row] && pts[row][cur % (PASSES * PTS)];
      if (p) gsap.set(can.current, { x: p.x - 8, y: p.y - 10, opacity: prog > 0.001 && prog < 2.999 ? 1 : 0 });
    };

    // The pin is created synchronously (ScrollTrigger needs pins in page order); only the canvas layout waits for fonts.
    const proxy = { v: 0 };
    const caps = scope.querySelectorAll('.gs__cap');
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: scope.querySelector('.gs__stage'), start: 'top top', end: () => `+=${ROWS.length * 85}%`, pin: true, scrub: 0.6, anticipatePin: 1, invalidateOnRefresh: true } });
    tl.to(proxy, { v: 3, duration: 3, onUpdate: () => { prog = proxy.v; dirty = true; } }, 0);
    ROWS.forEach((_, i) => tl.fromTo(caps[i], { opacity: 0, y: 14, rotate: -8 }, { opacity: 1, y: 0, rotate: i % 2 ? 3 : -3, duration: 0.25, ease: 'back.out(2)' }, i + 0.7));
    tl.fromTo(scope.querySelector('.gs__strata'), { yPercent: 0 }, { yPercent: -6, duration: 3 }, 0);
    tl.to({}, { duration: 0.3 });

    const tick = () => { if (dirty && rows.length) { dirty = false; paint(); } };
    gsap.ticker.add(tick);
    const ready = (document.fonts && document.fonts.load ? document.fonts.load('100px Anton') : Promise.resolve()).then(() => { if (!dead) build(); });
    let rt;
    const stage0 = scope.querySelector('.gs__stage');
    const ro = new ResizeObserver(() => { clearTimeout(rt); rt = setTimeout(() => { if (stage0.clientWidth !== W || stage0.clientHeight !== H) build(); }, 250); });
    ro.observe(stage0);
    return () => { dead = true; clearTimeout(rt); ro.disconnect(); gsap.ticker.remove(tick); tl.kill(); ready.catch(() => {}); };
  }, []);

  return (
    <section ref={root} className="gs" aria-label="Models, services, Linux: the stack from top to bottom">
      <div className="gs__stage">
        <div className="gs__strata" aria-hidden="true"><i className="gs__band gs__band--poster" /><i className="gs__band gs__band--brick" /><i className="gs__band gs__band--foundation" /></div>
        <p className="gs__label mono">( From the top of the stack to the bottom )</p>
        <canvas ref={over} className="gs__over" aria-hidden="true" />
        <canvas ref={cv} className="gs__view" aria-hidden="true" />
        {ROWS.map((r) => <i key={r.t} className="gs__drips" aria-hidden="true" />)}
        {ROWS.map((r) => <span key={r.t} className="gs__cap mono">{r.cap}</span>)}
        <div ref={can} className="gs__can" aria-hidden="true"><CanIcon color="#ff3b1d" /></div>
        <ol className="gs__static">{ROWS.map((r) => <li key={r.t} style={{ '--f': r.fill, '--s': r.shadow }}>{r.t}<small className="mono">{r.cap}</small></li>)}</ol>
      </div>
    </section>
  );
}
