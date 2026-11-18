import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger } from '../animation/gsap';
import { scrollToTarget } from '../animation/smoothScroll';
import { sections } from '../data/content';

// The scrollbar is a film strip running between two reels, like an old projector: the supply reel (top) empties and the
// take-up reel (bottom) fills as you scroll, the sprocket holes crawl with the page, and a red play-head marks where you are.
const Reel = ({ r, wind, spin }) => (
  <svg className="rail__reel" viewBox="0 0 40 40" aria-hidden="true">
    <circle ref={wind} cx="20" cy="20" r="14" className="rail__wound" />
    <g ref={spin} style={{ transformOrigin: '20px 20px' }}>
      <circle cx="20" cy="20" r="7" className="rail__hub" />
      {[0, 120, 240].map((a) => <circle key={a} cx="20" cy="13.6" r="1.9" className="rail__hole" transform={`rotate(${a} 20 20)`} />)}
      <circle cx="20" cy="20" r="1.6" className="rail__axle" />
    </g>
  </svg>
);

export default function ScrollRail({ visible }) {
  const root = useRef(null);
  const topW = useRef(null), botW = useRef(null), topS = useRef(null), botS = useRef(null), strip = useRef(null), tape = useRef(null);
  const thumb = useRef(null);
  const pct = useRef(null);
  const [marks, setMarks] = useState([]);
  const [on, setOn] = useState(0);
  const drag = useRef(false);
  const maxRef = useRef(1);

  // true positions of each section, re-measured whenever ScrollTrigger refreshes
  useEffect(() => {
    const measure = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      if (max <= 0) return;
      maxRef.current = max;
      setMarks(sections.map((s) => {
        const el = document.getElementById(s.id);
        const top = el ? el.getBoundingClientRect().top + window.scrollY : 0;
        return { ...s, p: Math.min(1, Math.max(0, top / max)) };
      }));
    };
    measure();
    ScrollTrigger.addEventListener('refresh', measure);
    window.addEventListener('resize', measure);
    return () => { ScrollTrigger.removeEventListener('refresh', measure); window.removeEventListener('resize', measure); };
  }, []);

  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = maxRef.current;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (Math.abs(p - (update.p ?? -1)) < 0.0004) return;
      update.p = p;
      thumb.current.style.top = `${p * 100}%`;
      // film moves from the top reel to the bottom one: radii trade places, reels turn, sprocket holes crawl
      topW.current.setAttribute('r', (6 + 8.5 * (1 - p)).toFixed(2));
      botW.current.setAttribute('r', (6 + 8.5 * p).toFixed(2));
      topS.current.style.transform = `rotate(${-window.scrollY * 0.12}deg)`;
      botS.current.style.transform = `rotate(${-window.scrollY * 0.12}deg)`;
      strip.current.style.backgroundPositionY = `${-window.scrollY * 0.35}px`;
      pct.current.textContent = String(Math.round(p * 100)).padStart(2, '0');
      let cur = 0;
      marks.forEach((m, i) => { if (m.p <= p + 0.004) cur = i; });
      setOn((o) => (o === cur ? o : cur));
    };
    const onS = () => { if (!raf) raf = requestAnimationFrame(update); };
    window.addEventListener('scroll', onS, { passive: true });
    update();
    return () => { cancelAnimationFrame(raf); window.removeEventListener('scroll', onS); };
  }, [marks]);

  useEffect(() => { gsap.to(root.current, { autoAlpha: visible ? 1 : 0, x: visible ? 0 : 24, duration: 0.9, ease: 'expo.out', delay: visible ? 1 : 0 }); }, [visible]);

  // dragging the can-cap scrubs the real page (through Lenis, immediately)
  useEffect(() => {
    const el = root.current;
    const toScroll = (clientY) => {
      const r = tape.current.getBoundingClientRect();
      const p = Math.min(1, Math.max(0, (clientY - r.top) / r.height));
      scrollToTarget(p * (document.documentElement.scrollHeight - window.innerHeight), { immediate: true, force: true });
    };
    const down = (e) => { if (e.target.closest('.rail__mark')) return; drag.current = true; el.setPointerCapture?.(e.pointerId); toScroll(e.clientY); };
    const move = (e) => drag.current && toScroll(e.clientY);
    const up = () => { drag.current = false; };
    el.addEventListener('pointerdown', down); el.addEventListener('pointermove', move); el.addEventListener('pointerup', up); el.addEventListener('pointercancel', up);
    return () => { el.removeEventListener('pointerdown', down); el.removeEventListener('pointermove', move); el.removeEventListener('pointerup', up); el.removeEventListener('pointercancel', up); };
  }, []);

  const jump = (id) => scrollToTarget(id === 'top' ? 0 : `#${id}`);
  return (
    <div ref={root} className="rail" style={{ visibility: 'hidden' }}>
      <p className="rail__pct mono" aria-hidden="true"><b ref={pct}>00</b>%</p>
      <Reel wind={topW} spin={topS} />
      <div ref={tape} className="rail__tape">
        <div ref={strip} className="rail__strip" aria-hidden="true" />
      {marks.map((m, i) => (
        <button key={m.id} className={`rail__mark ${on === i ? 'is-on' : ''}`} style={{ top: `${m.p * 100}%` }} onClick={() => jump(m.id)} aria-label={`Jump to ${m.label}`} data-magnet>
          <svg viewBox="0 0 20 20" aria-hidden="true"><path d="M3 3 L17 17 M17 3 L3 17" stroke="currentColor" strokeWidth="4.5" strokeLinecap="round" /></svg>
          <span className="rail__tip mono">{m.n} {m.label}</span>
        </button>
      ))}
      <div ref={thumb} className="rail__thumb" aria-hidden="true"><i /><b>REC</b></div>
      </div>
      <Reel wind={botW} spin={botS} />
    </div>
  );
}
