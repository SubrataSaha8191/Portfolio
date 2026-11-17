import { useEffect, useRef } from 'react';
import { gsap, isCoarse, prefersReducedMotion } from '../animation/gsap';

const MAGNET = '[data-magnet], .btn, .nav__menu, .cs__close, .nav__logo, .hero__cue, .lab__proj button, .foot button';
const LENS = '.display, .menu__link, .row__title, .hero__line, .contact__title, .giant__word, .about__h, .step h3, .band__title, .manifesto__text';

/**
 * Cursor with four behaviours:
 *   idle    a ring that lags the pointer and stretches along its velocity (liquid feel)
 *   lens    over big type it becomes a difference-blend disc that inverts the letters beneath
 *   magnet  over buttons it stops following and morphs into the button's own outline
 *   label   [data-cursor="Open"] fills lime and shows the word
 */
export default function Cursor() {
  const wrap = useRef(null);
  const blob = useRef(null);
  const dot = useRef(null);
  const label = useRef(null);

  useEffect(() => {
    if (isCoarse()) return;
    const reduced = prefersReducedMotion();
    document.documentElement.classList.add('has-cursor');
    const b = blob.current;
    gsap.set(b, { xPercent: -50, yPercent: -50 });
    const xTo = gsap.quickTo(wrap.current, 'x', { duration: reduced ? 0 : 0.5, ease: 'power3' });
    const yTo = gsap.quickTo(wrap.current, 'y', { duration: reduced ? 0 : 0.5, ease: 'power3' });
    const dx = gsap.quickTo(dot.current, 'x', { duration: 0.06, ease: 'none' });
    const dy = gsap.quickTo(dot.current, 'y', { duration: 0.06, ease: 'none' });
    const st = { mode: 'idle', el: null, vx: 0, vy: 0, sx: 0, sy: 0, shown: false };

    const setMode = (mode, el) => {
      st.mode = mode; st.el = el;
      b.dataset.mode = mode;
      const cs = el && getComputedStyle(el);
      if (mode === 'magnet') {
        const r = el.getBoundingClientRect();
        gsap.to(b, { width: r.width + 14, height: r.height + 10, borderRadius: cs.borderRadius === '0px' ? '10px' : cs.borderRadius, rotation: 0, scaleX: 1, scaleY: 1, duration: 0.55, ease: 'expo.out', overwrite: 'auto' });
        gsap.to(dot.current, { opacity: 0, duration: 0.2 });
      } else {
        const size = mode === 'lens' ? 118 : mode === 'label' ? 88 : 38;
        gsap.to(b, { width: size, height: size, borderRadius: '50%', duration: 0.55, ease: 'expo.out', overwrite: 'auto' });
        gsap.to(dot.current, { opacity: mode === 'idle' ? 1 : 0, duration: 0.2 });
      }
    };

    const move = (e) => {
      st.sx = e.clientX; st.sy = e.clientY;
      st.vx = e.movementX || 0; st.vy = e.movementY || 0;
      dx(e.clientX); dy(e.clientY);
      if (st.mode === 'magnet' && st.el) {
        const r = st.el.getBoundingClientRect();
        xTo(r.left + r.width / 2); yTo(r.top + r.height / 2);
      } else { xTo(e.clientX); yTo(e.clientY); }
      if (!st.shown) {
        st.shown = true;
        gsap.set(wrap.current, { x: e.clientX, y: e.clientY });
        gsap.to([wrap.current, dot.current], { opacity: 1, duration: 0.3 });
      }
    };

    const over = (e) => {
      const t = e.target;
      if (!t.closest) return;
      const mag = t.closest(MAGNET);
      const lab = t.closest('[data-cursor]');
      const lens = t.closest(LENS);
      let mode = 'idle', el = null;
      if (mag && !lab?.dataset.cursor?.length) { mode = 'magnet'; el = mag; }
      else if (lab && lab.dataset.cursor) { mode = 'label'; label.current.textContent = lab.dataset.cursor; el = lab; }
      else if (lens) { mode = 'lens'; el = lens; }
      if (mode !== 'label') label.current.textContent = '';
      if (mode !== st.mode || el !== st.el) setMode(mode, el);
    };

    // velocity stretch (only while following freely)
    const tick = () => {
      st.vx *= 0.82; st.vy *= 0.82;
      if (reduced || st.mode === 'magnet') return;
      const v = Math.min(Math.hypot(st.vx, st.vy), 60);
      const s = v * 0.012;
      gsap.set(b, { scaleX: 1 + s, scaleY: 1 - s * 0.45, rotation: (Math.atan2(st.vy, st.vx) * 180) / Math.PI });
    };
    gsap.ticker.add(tick);

    const leave = () => { st.shown = false; gsap.to([wrap.current, dot.current], { opacity: 0, duration: 0.3 }); };
    const down = () => gsap.to(b, { scale: 0.82, duration: 0.2, overwrite: false });
    const up = () => gsap.to(b, { scale: 1, duration: 0.5, ease: 'elastic.out(1,0.5)', overwrite: false });
    window.addEventListener('pointermove', move, { passive: true });
    window.addEventListener('pointerdown', down);
    window.addEventListener('pointerup', up);
    document.addEventListener('pointerover', over, { passive: true });
    document.documentElement.addEventListener('pointerleave', leave);
    return () => {
      gsap.ticker.remove(tick);
      document.documentElement.classList.remove('has-cursor');
      window.removeEventListener('pointermove', move);
      window.removeEventListener('pointerdown', down);
      window.removeEventListener('pointerup', up);
      document.removeEventListener('pointerover', over);
      document.documentElement.removeEventListener('pointerleave', leave);
    };
  }, []);

  return (
    <div className="cursor" aria-hidden="true">
      <div ref={wrap} className="cursor__wrap"><div ref={blob} className="cursor__blob" data-mode="idle"><span ref={label} /></div></div>
      <div ref={dot} className="cursor__dot" />
    </div>
  );
}
