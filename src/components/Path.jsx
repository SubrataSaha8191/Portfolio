import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { initReveals } from '../animation/reveals';
import { path } from '../data/content';

// seeded pseudo-random pattern for the QR-style tile (a decorative nod to the invitation feature)
const QR = (() => { let t = 7; const r = () => { t = (t * 16807) % 2147483647; return t / 2147483647; }; return Array.from({ length: 121 }, () => r() > 0.52); })();

const VIS = {
  edu: () => (
    <svg viewBox="0 0 220 140" className="pv-svg" aria-hidden="true">
      <path d="M110 24 L200 62 L110 100 L20 62 Z" fill="none" stroke="currentColor" strokeWidth="3" strokeLinejoin="round" />
      <path d="M58 82 V108 Q110 134 162 108 V82" fill="none" stroke="currentColor" strokeWidth="3" />
      <path d="M200 62 V104" stroke="currentColor" strokeWidth="3" strokeLinecap="round" />
      <circle cx="200" cy="110" r="6" fill="currentColor" className="pv-pulse" />
    </svg>
  ),
  hult: () => (
    <svg viewBox="0 0 240 140" className="pv-svg" aria-hidden="true">
      <circle cx="120" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="2.5" />
      <ellipse cx="120" cy="70" rx="24" ry="58" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M62 70 H178 M72 42 H168 M72 98 H168" stroke="currentColor" strokeWidth="1.5" />
      <path d="M40 112 Q120 -10 200 100" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6 7" className="pv-flow" />
      {[[40, 112], [200, 100]].map(([x, y]) => <circle key={x} cx={x} cy={y} r="7" fill="currentColor" className="pv-pulse" />)}
    </svg>
  ),
  sih: () => (
    <svg viewBox="0 0 260 130" className="pv-svg" aria-hidden="true">
      {[[60, 70], [140, 45], [205, 85]].map(([x, y], k) => (
        <g key={k} className="pv-heat" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${k * 0.7}s` }}>
          {[34, 23, 13, 5].map((r) => <circle key={r} cx={x} cy={y} r={r} fill={r === 5 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2.2" />)}
        </g>
      ))}
    </svg>
  ),
  qr: () => (
    <svg viewBox="0 0 110 110" className="pv-svg pv-qr" aria-hidden="true">
      {QR.map((on, i) => on && <rect key={i} x={(i % 11) * 10} y={Math.floor(i / 11) * 10} width="8" height="8" rx="1.5" fill="currentColor" />)}
      {[[0, 0], [80, 0], [0, 80]].map(([x, y]) => <g key={`${x}-${y}`}><rect x={x} y={y} width="30" height="30" fill="var(--bg)" /><rect x={x + 2} y={y + 2} width="26" height="26" fill="none" stroke="currentColor" strokeWidth="5" /><rect x={x + 10} y={y + 10} width="10" height="10" fill="currentColor" /></g>)}
    </svg>
  ),
  git: () => (
    <svg viewBox="0 0 260 120" className="pv-svg" aria-hidden="true">
      <path d="M10 60 H250" stroke="currentColor" strokeWidth="2.5" />
      <path d="M60 60 Q80 20 110 20 H170 Q190 20 200 60" fill="none" stroke="var(--lime)" strokeWidth="3" className="pv-flow" strokeDasharray="6 6" />
      <path d="M40 60 Q60 104 90 104 H150 Q170 104 180 60" fill="none" stroke="var(--lime)" strokeWidth="3" className="pv-flow" strokeDasharray="6 6" />
      {[10, 60, 110, 170, 200, 250, 90, 150].map((x, i) => <circle key={i} cx={x} cy={i < 6 ? 60 : i === 6 ? 104 : 104} r="5.5" fill={i % 2 ? 'var(--lime)' : 'currentColor'} />)}
    </svg>
  ),
};

/**
 * Path drifts diagonally: while pinned, a tilted film-strip of chapters travels from the
 * lower right to the upper left, and each card scales up as it crosses the centre.
 */
export default function Path() {
  const root = useRef(null);
  useSection(root, ({ cleanups, scope }) => {
    initReveals(scope, cleanups);
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const stage = scope.querySelector('.path__stage');
    const track = scope.querySelector('.path__track');
    const dist = () => track.scrollWidth - window.innerWidth * 0.55;
    const move = gsap.fromTo(track, { x: () => window.innerWidth * 0.18, y: () => window.innerHeight * 0.05 }, {
      x: () => -dist(), y: () => -window.innerHeight * 0.025, ease: 'none', force3D: true,
      scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${dist() + window.innerWidth * 0.2}`, pin: true, scrub: 1.2, anticipatePin: 1, invalidateOnRefresh: true },
    });
    // one light scale tween per card (no opacity, no second competing tween) so the drift stays fluid
    scope.querySelectorAll('.step').forEach((el) => {
      gsap.fromTo(el, { scale: 0.9 }, { scale: 1, ease: 'none', force3D: true, scrollTrigger: { trigger: el, containerAnimation: move, start: 'left 100%', end: 'left 55%', scrub: 1 } });
    });
  }, []);

  return (
    <section id="path" ref={root} className="path" aria-labelledby="path-title">
      <span className="bgword" aria-hidden="true">Chapters</span>
      <div className="path__stage">
        <header className="sect-head wrap">
          <p className="label mono" data-reveal>( 05 — Path )</p>
          <h2 id="path-title" className="display" data-split data-fx="zoom">Chapters so far.</h2>
        </header>
        <ol className="path__track">
          {path.map((s, i) => (
            <li className={`step card--${s.tone}`} key={s.n} style={{ '--i': i }}>
              <span className="step__n" aria-hidden="true">{s.n}</span>
              <p className="step__tag mono">{s.tag}{s.when ? ` · ${s.when}` : ''}</p>
              <h3>{s.title}</h3>
              <p className="step__where">{s.where}</p>
              <p className="step__text">{s.text}</p>
              <ul className="step__chips">{s.chips.map((c) => <li key={c}>{c}</li>)}</ul>
              <div className="step__vis">{VIS[s.vis]()}</div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
