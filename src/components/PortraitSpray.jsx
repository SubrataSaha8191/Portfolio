import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { dab, PAINT } from '../animation/spray';
import { buildStencil } from '../art/stencil';
import CanIcon from './CanIcon';

const W = 768, H = 900;

/**
 * The hero portrait is spray-painted into existence. A sprayer sweeps the stencil in a serpentine,
 * depositing a spray mask; the visible stencil is `stencil ∘ mask`. Afterwards the pointer sprays the real
 * photograph through the same stencil (and it fades back). Only redraws when something changed.
 */
const PortraitSpray = forwardRef(function PortraitSpray({ onReady }, ref) {
  const box = useRef(null);
  const main = useRef(null);
  const over = useRef(null);
  const can = useRef(null);
  const S = useRef({ done: false, dirty: true, photoAlpha: 0 });
  // the can lives in the hero itself (not inside the portrait's layer) so it always paints above the title lettering
  const [host, setHost] = useState(null);
  useEffect(() => { setHost(box.current.closest('.gh')); }, []);

  useEffect(() => {
    let dead = false, tick = null;
    const s = S.current;
    const reduced = prefersReducedMotion();
    buildStencil('/portrait.webp', W, H).then(({ stencil, photo }) => {
      if (dead) return;
      const mk = (w, h) => { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; };
      s.stencil = stencil; s.photo = photo;
      s.M = mk(W, H); s.PM = mk(W, H); s.P = mk(W, H);
      s.mctx = s.M.getContext('2d'); s.pmctx = s.PM.getContext('2d'); s.pctx = s.P.getContext('2d');
      main.current.width = W; main.current.height = H;
      over.current.width = Math.round(W * 1.4); over.current.height = Math.round(H * 1.1);
      s.g = main.current.getContext('2d'); s.octx = over.current.getContext('2d');
      if (reduced) { s.done = true; }
      s.dirty = true;
      tick = () => {
        if (!s.dirty) return;
        s.dirty = false;
        const g = s.g;
        g.clearRect(0, 0, W, H);
        g.drawImage(s.stencil, 0, 0);
        if (!s.done) { g.globalCompositeOperation = 'destination-in'; g.drawImage(s.M, 0, 0); g.globalCompositeOperation = 'source-over'; }
        if (s.photoAlpha > 0.01) {
          s.pctx.clearRect(0, 0, W, H);
          s.pctx.drawImage(s.photo, 0, 0);
          s.pctx.globalCompositeOperation = 'destination-in';
          s.pctx.drawImage(s.PM, 0, 0);
          s.pctx.globalCompositeOperation = 'source-over';
          g.globalAlpha = s.photoAlpha;
          g.drawImage(s.P, 0, 0);
          g.globalAlpha = 1;
          if (s.photoAlpha < 1) s.dirty = true;
        }
      };
      gsap.ticker.add(tick);
      onReady?.();
    });

    // pointer sprays the true-colour photo through the stencil
    const el = box.current;
    const mv = (e) => {
      if (!s.done || !s.pmctx) return;
      const r = el.getBoundingClientRect();
      const x = ((e.clientX - r.left) / r.width) * W, y = ((e.clientY - r.top) / r.height) * H;
      if (x < 0 || y < 0 || x > W || y > H) return;
      dab(s.pmctx, x, y, 54, '#fff', 46, 1, [2, 4.5]);
      s.photoAlpha = 1; s.dirty = true;
      gsap.killTweensOf(s, 'photoAlpha');
      gsap.to(s, { photoAlpha: 0, duration: 1.3, delay: 1.5, ease: 'power1.in', onUpdate: () => { s.dirty = true; }, onComplete: () => s.pmctx.clearRect(0, 0, W, H) });
    };
    el.addEventListener('pointermove', mv);
    return () => { dead = true; el.removeEventListener('pointermove', mv); if (tick) gsap.ticker.remove(tick); gsap.killTweensOf(s); };
    // eslint-disable-next-line
  }, []);

  useImperativeHandle(ref, () => ({
    // jump to the finished portrait (used when scrolling outruns the spray)
    finish() {
      const s = S.current;
      if (!s.M || s.done) return;
      // painting is under way: don't jump, just run the sweep much faster so it still goes top to bottom, row by row
      if (s.tl && s.tl.isActive()) { s.boost = 9; s.tl.timeScale(9); return; }
      if (s.tl) s.tl.kill();
      s.mctx.fillStyle = '#fff'; s.mctx.fillRect(0, 0, W, H);
      s.done = true; s.dirty = true;
      if (can.current) gsap.set(can.current, { opacity: 0 });
    },
    play() {
      const s = S.current;
      if (!s.M || s.done) return null;
      if (s.tl) return s.tl; // already painting (scroll can re-fire this): never restart mid-way
      const bw = box.current.clientWidth, bh = box.current.clientHeight;
      const canEl = can.current;
      const pos = { x: -70, y: 40 }, last = { x: -70, y: 40 };
      const passes = 8, rowH = (H - 60) / (passes - 1);
      let curDir = 1;
      // the portrait box and the hero don't move relative to each other while painting: measure once, never per frame
      const br0 = box.current.getBoundingClientRect(), gr0 = host.getBoundingClientRect();
      const rel = { l: br0.left - gr0.left, t: br0.top - gr0.top, w: br0.width, h: br0.height };
      const emit = () => {
        const dx = pos.x - last.x, dy = pos.y - last.y, dist = Math.hypot(dx, dy);
        const steps = Math.max(1, Math.ceil(dist / 9));
        for (let i = 1; i <= steps; i++) {
          const x = last.x + (dx * i) / steps, y = last.y + (dy * i) / steps;
          // the paint trails ~40px behind the nozzle, so the can is always visibly ahead of what it has painted
          dab(s.mctx, x - curDir * 40, y, 44, '#fff', 90, 1, [2, 4.2]);
          if (Math.random() < 0.35) dab(s.octx, x + W * 0.2, y + H * 0.05, 90, Math.random() < 0.55 ? PAINT.red : PAINT.yellow, 5, 0.32, [1, 2.6]);
        }
        last.x = pos.x; last.y = pos.y;
        // the can's nozzle tip is ~29px right of its left edge: align the tip with the point being painted
        gsap.set(canEl, { x: rel.l + (pos.x / W) * rel.w - 29, y: rel.t + (pos.y / H) * rel.h - 4 });
        s.dirty = true;
      };
      const tl = gsap.timeline();
      tl.set(canEl, { opacity: 1 });
      for (let k = 0; k < passes; k++) {
        const y = 30 + k * rowH, dir = k % 2 ? -1 : 1;
        tl.call(() => { curDir = dir; })
          .to(pos, { y, duration: 0.14, ease: 'power1.inOut', onUpdate: emit })
          .to(pos, { x: dir > 0 ? W + 70 : -70, duration: 0.4, ease: 'none', onUpdate: emit });
      }
      tl.to(canEl, { opacity: 0, x: '+=60', y: '+=40', duration: 0.35, ease: 'power2.in' })
        .to({}, { duration: 0.6, onUpdate() { s.mctx.globalAlpha = 0.3; s.mctx.fillStyle = '#fff'; s.mctx.fillRect(0, 0, W, H); s.mctx.globalAlpha = 1; s.dirty = true; } }, '<')
        .call(() => { s.done = true; s.dirty = true; });
      s.tl = tl;
      // scrolling while it paints speeds the can up (still strictly top to bottom), easing back to normal when scrolling stops
      let idle = 0;
      const onScroll = () => {
        if (s.boost) return;
        tl.timeScale(2.6);
        clearTimeout(idle);
        idle = setTimeout(() => { if (!s.boost) gsap.to(tl, { timeScale: 1, duration: 0.5 }); }, 160);
      };
      window.addEventListener('scroll', onScroll, { passive: true });
      tl.eventCallback('onComplete', () => { window.removeEventListener('scroll', onScroll); clearTimeout(idle); });
      return tl;
    },
  }));

  return (
    <div ref={box} className="gp" data-spray aria-hidden="true">
      <canvas ref={over} className="gp__over" />
      <canvas ref={main} className="gp__main" />
      {host && createPortal(<div ref={can} className="gp__can"><CanIcon color="#ffd60a" /></div>, host)}
    </div>
  );
});

export default PortraitSpray;
