import { useEffect, useRef } from 'react';
import { gsap } from '../animation/gsap';
import { scrollToTarget } from '../animation/smoothScroll';
import { sections } from '../data/content';

const TICKS = 48;

/**
 * Not a bar: a dial. A ring of ticks lights up as you travel, the centre shows how much of
 * the page is left, and the caption says how many screens remain. Clicking jumps to the
 * next chapter (or back to the top at the end). All updates are written straight to the DOM.
 */
export default function ScrollDial({ visible }) {
  const root = useRef(null);
  const ticks = useRef([]);
  const pct = useRef(null);
  const left = useRef(null);
  const name = useRef(null);
  const last = useRef(-1);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = document.documentElement.scrollHeight - window.innerHeight;
      const y = window.scrollY;
      const p = max > 0 ? Math.min(1, Math.max(0, y / max)) : 0;
      const lit = Math.round(p * TICKS);
      if (lit !== last.current) {
        ticks.current.forEach((t, i) => t && (t.style.opacity = i < lit ? '1' : '0.22'));
        last.current = lit;
      }
      pct.current.textContent = String(Math.round(p * 100)).padStart(2, '0');
      const screens = Math.max(0, (max - y) / window.innerHeight);
      left.current.textContent = p >= 0.995 ? 'end of page' : `${screens.toFixed(1)} screens left`;
      let cur = sections[0];
      sections.forEach((s) => {
        const el = document.getElementById(s.id);
        if (el && el.getBoundingClientRect().top < window.innerHeight * 0.5) cur = s;
      });
      name.current.textContent = `${cur.n} ${cur.label}`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', on, { passive: true });
    window.addEventListener('resize', on);
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', on); window.removeEventListener('resize', on); };
  }, []);

  useEffect(() => {
    gsap.to(root.current, { autoAlpha: visible ? 1 : 0, x: visible ? 0 : 30, duration: 0.9, ease: 'expo.out', delay: visible ? 0.8 : 0 });
  }, [visible]);

  const next = () => {
    const y = window.scrollY;
    const tops = sections.map((s) => { const el = document.getElementById(s.id); return el ? el.getBoundingClientRect().top + y : Infinity; });
    const nxt = tops.find((t) => t > y + window.innerHeight * 0.55);
    scrollToTarget(nxt === undefined ? 0 : nxt);
  };

  return (
    <button ref={root} className="dial" onClick={next} aria-label="Scroll progress. Activate to jump to the next section" data-cursor="Next" style={{ visibility: 'hidden' }}>
      <svg viewBox="0 0 100 100" aria-hidden="true">
        {Array.from({ length: TICKS }, (_, i) => {
          const a = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
          const major = i % 4 === 0;
          const r1 = major ? 38 : 41;
          return <line key={i} ref={(el) => (ticks.current[i] = el)} x1={50 + Math.cos(a) * r1} y1={50 + Math.sin(a) * r1} x2={50 + Math.cos(a) * 46} y2={50 + Math.sin(a) * 46} stroke="var(--lime)" strokeWidth={major ? 1.6 : 1} strokeLinecap="round" style={{ opacity: 0.22 }} />;
        })}
      </svg>
      <span className="dial__pct"><b ref={pct}>00</b><em>%</em></span>
      <span className="dial__cap mono"><span ref={name}>00 Identity</span><span ref={left}>0.0 screens left</span></span>
    </button>
  );
}
