import { useEffect, useRef } from 'react';
import { gsap, isCoarse, prefersReducedMotion } from '../animation/gsap';
import CanIcon from './CanIcon';

const PAL = ['#ff3b1d', '#ffd60a', '#11b5e4', '#ff4fa3'];
const N = 150;

/**
 * The cursor is an aerosol can. It tilts with pointer velocity and sprays a short, pooled mist
 * (150 particles, one canvas, no DOM churn). Context changes it:
 *   over the portrait  → heavy spraying;  over links/buttons → can leans in with an OPEN tag;
 *   [data-cursor="…"]  → labelled tag;  the scroll thumb → DRAG.   Click bursts paint.
 */
export default function SprayCursor() {
  const can = useRef(null);
  const label = useRef(null);
  const mist = useRef(null);

  useEffect(() => {
    if (isCoarse()) return;
    const reduced = prefersReducedMotion();
    document.documentElement.classList.add('has-spray');
    const cv = mist.current, ctx = cv.getContext('2d');
    const fit = () => { cv.width = window.innerWidth; cv.height = window.innerHeight; };
    fit();
    window.addEventListener('resize', fit);

    const P = Array.from({ length: N }, () => ({ x: 0, y: 0, vx: 0, vy: 0, l: 0, m: 1, s: 2, c: 0 }));
    let head = 0, live = 0;
    const m = { x: -100, y: -100, vx: 0, vy: 0, seen: false };
    const c = { x: -100, y: -100, rot: -32, sc: 1 };
    const st = { mode: 'idle', labelText: '', t: 0 };

    const emit = (x, y, n, spread = 1, burst = false) => {
      for (let i = 0; i < n; i++) {
        const p = P[head]; head = (head + 1) % N;
        const a = burst ? Math.random() * 6.2832 : (-2.2 + (Math.random() - 0.5) * 0.9 * spread);
        const sp = burst ? 1.5 + Math.random() * 4.5 : 0.8 + Math.random() * 2.6;
        p.x = x; p.y = y; p.vx = Math.cos(a) * sp + m.vx * 0.08; p.vy = Math.sin(a) * sp + m.vy * 0.08;
        p.l = p.m = 24 + Math.random() * 26; p.s = 1.5 + Math.random() * 2.6; p.c = ((st.t * 0.7) | 0) % PAL.length;
        if (burst) p.c = (Math.random() * PAL.length) | 0;
      }
    };

    const move = (e) => {
      m.vx = e.movementX || 0; m.vy = e.movementY || 0;
      m.x = e.clientX; m.y = e.clientY;
      if (!m.seen) { m.seen = true; c.x = m.x; c.y = m.y; gsap.to(can.current, { opacity: 1, duration: 0.3 }); }
    };
    const over = (e) => {
      const t = e.target;
      if (!t.closest) return;
      let mode = 'idle', text = '';
      const lab = t.closest('[data-cursor]');
      if (t.closest('.rail__thumb')) { mode = 'link'; text = 'Drag'; }
      else if (t.closest('[data-spray]')) { mode = 'portrait'; text = ''; }
      else if (lab && lab.dataset.cursor) { mode = 'link'; text = lab.dataset.cursor; }
      else if (t.closest('a, button, [data-magnet], .sticker')) { mode = 'link'; text = t.closest('a')?.target === '_blank' ? 'Open' : ''; }
      st.mode = mode; st.labelText = text;
      label.current.textContent = text;
      gsap.to(label.current, { opacity: text ? 1 : 0, duration: 0.2 });
    };
    const down = () => { if (!reduced) emit(c.x - 6, c.y - 12, 24, 1, true); gsap.to(can.current, { scale: 0.85, duration: 0.12 }); };
    const up = () => gsap.to(can.current, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.4)' });
    const leave = () => gsap.to([can.current, label.current], { opacity: 0, duration: 0.2 });
    const enter = () => m.seen && gsap.to(can.current, { opacity: 1, duration: 0.2 });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    document.documentElement.addEventListener('pointerenter', enter);

    const tick = (time, dt) => {
      st.t = time;
      c.x += (m.x - c.x) * 0.38; c.y += (m.y - c.y) * 0.38;
      const speed = Math.hypot(m.vx, m.vy);
      const targetRot = -32 + Math.max(-38, Math.min(38, m.vx * 1.4));
      c.rot += (targetRot - c.rot) * 0.2;
      const lean = st.mode === 'link' ? 1.28 : 1;
      c.sc += (lean - c.sc) * 0.2;
      const moved = Math.abs(m.x - c.x) + Math.abs(m.y - c.y) + Math.abs(c.sc - lean) + Math.abs(c.rot - targetRot);
      if (moved > 0.02 || st.dirty) {
        st.dirty = false;
        gsap.set(can.current, { x: c.x - 15, y: c.y - 30, rotation: c.rot, scale: c.sc, transformOrigin: '50% 88%' });
        gsap.set(label.current, { x: c.x + 24, y: c.y + 6 });
      }
      m.vx *= 0.8; m.vy *= 0.8;
      let rate0 = 0;
      if (!reduced) {
        const rate = st.mode === 'portrait' ? (speed > 0.6 ? 7 : 3) : speed > 3 ? Math.min(5, 1 + (speed / 8) | 0) : 0;
        rate0 = rate;
        if (rate) emit(c.x - 8, c.y - 22, rate, st.mode === 'portrait' ? 1.6 : 1);
      }
      // draw mist (nothing to do, and nothing to clear, when no particle is alive)
      const had = live;
      live = 0;
      if (!had && !rate0) return;
      ctx.clearRect(0, 0, cv.width, cv.height);
      for (let i = 0; i < N; i++) {
        const p = P[i];
        if (p.l <= 0) continue;
        p.l -= dt / 16.7; live++;
        p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.015;
        ctx.globalAlpha = Math.max(0, p.l / p.m) * 0.75;
        ctx.fillStyle = PAL[p.c];
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
      ctx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);
    return () => {
      gsap.ticker.remove(tick);
      document.documentElement.classList.remove('has-spray');
      window.removeEventListener('resize', fit);
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
      document.documentElement.removeEventListener('pointerenter', enter);
    };
  }, []);

  return (
    <div className="spray" aria-hidden="true">
      <canvas ref={mist} className="spray__mist" />
      <div ref={can} className="spray__can"><CanIcon color="#ff3b1d" /></div>
      <div ref={label} className="spray__label" />
    </div>
  );
}
