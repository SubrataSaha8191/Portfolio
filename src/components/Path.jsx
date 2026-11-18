import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { path } from '../data/content';
import { TaxiSide } from './Taxi';

// seeded skyline so the city is stable between renders
const CITY = (() => { let t = 11; const r = () => { t = (t * 16807) % 2147483647; return t / 2147483647; }; let x = 0; const b = []; while (x < 3600) { const w = 70 + r() * 90, h = 110 + r() * 250; b.push({ x, w, h, tank: r() > 0.8 }); x += w + 6 + r() * 14; } return b; })();

const QR = (() => { let t = 7; const r = () => { t = (t * 16807) % 2147483647; return t / 2147483647; }; return Array.from({ length: 121 }, () => r() > 0.52); })();
const VIS = {
  edu: () => (<svg viewBox="0 0 220 140" className="pv-svg" aria-hidden="true"><path d="M110 24 L200 62 L110 100 L20 62 Z" fill="none" stroke="currentColor" strokeWidth="5" strokeLinejoin="round" /><path d="M58 82 V108 Q110 134 162 108 V82" fill="none" stroke="currentColor" strokeWidth="5" /><path d="M200 62 V104" stroke="currentColor" strokeWidth="5" strokeLinecap="round" /></svg>),
  hult: () => (<svg viewBox="0 0 240 140" className="pv-svg" aria-hidden="true"><circle cx="120" cy="70" r="58" fill="none" stroke="currentColor" strokeWidth="4.5" /><ellipse cx="120" cy="70" rx="24" ry="58" fill="none" stroke="currentColor" strokeWidth="3" /><path d="M62 70 H178 M72 42 H168 M72 98 H168" stroke="currentColor" strokeWidth="3" /><path d="M40 112 Q120 -10 200 100" fill="none" stroke="currentColor" strokeWidth="5" strokeDasharray="6 8" className="pv-flow" /></svg>),
  sih: () => (<svg viewBox="0 0 260 130" className="pv-svg" aria-hidden="true">{[[60, 70], [140, 45], [205, 85]].map(([x, y], k) => (<g key={k} className="pv-heat" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${k * 0.7}s` }}>{[34, 23, 13, 5].map((r) => <circle key={r} cx={x} cy={y} r={r} fill={r === 5 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="3.4" />)}</g>))}</svg>),
  qr: () => (<svg viewBox="0 0 110 110" className="pv-svg pv-qr" aria-hidden="true">{QR.map((o, i) => o && <rect key={i} x={(i % 11) * 10} y={Math.floor(i / 11) * 10} width="8" height="8" rx="1.5" fill="currentColor" />)}{[[0, 0], [80, 0], [0, 80]].map(([x, y]) => <g key={`${x}-${y}`}><rect x={x} y={y} width="30" height="30" fill="var(--bg)" /><rect x={x + 2} y={y + 2} width="26" height="26" fill="none" stroke="currentColor" strokeWidth="5" /><rect x={x + 10} y={y + 10} width="10" height="10" fill="currentColor" /></g>)}</svg>),
  git: () => (<svg viewBox="0 0 260 120" className="pv-svg" aria-hidden="true"><path d="M10 60 H250" stroke="currentColor" strokeWidth="4" /><path d="M60 60 Q80 20 110 20 H170 Q190 20 200 60" fill="none" stroke="#ffd60a" strokeWidth="5" className="pv-flow" strokeDasharray="6 7" /><path d="M40 60 Q60 104 90 104 H150 Q170 104 180 60" fill="none" stroke="#ff3b1d" strokeWidth="5" className="pv-flow" strokeDasharray="6 7" />{[10, 60, 110, 170, 200, 250].map((x) => <circle key={x} cx={x} cy="60" r="7" fill="currentColor" />)}</svg>),
};

/**
 * Path is a road trip. While pinned, the graffiti taxi drives the road (wheels spin, lane dashes slide, the
 * skyline drifts at a different speed) and the chapters of the journey are billboards on poles that pass by.
 */
export default function Path() {
  const root = useRef(null);
  useSection(root, ({ scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const stage = scope.querySelector('.rt__stage');
    const track = scope.querySelector('.rt__track');
    const taxi = scope.querySelector('.rt__taxi');
    const START = () => window.innerWidth * 0.42;
    // the trip ends with the taxi parked right under the middle of the LAST billboard
    const dist = () => {
      const last = track.lastElementChild.querySelector('.bb__card');
      const cx = last.getBoundingClientRect().left - track.getBoundingClientRect().left + last.offsetWidth / 2;
      const sr = stage.getBoundingClientRect(), tr = taxi.getBoundingClientRect();
      const taxiX = tr.left - sr.left + tr.width * 0.55;
      return Math.max(200, cx + START() - taxiX - (gsap.getProperty(track, 'x') - START() + START()) * 0);
    };
    const HOLD = 1.18; // the last stretch is a pause with the taxi parked at the last card
    const ease = (t) => Math.min(1, t * HOLD);
    const end = () => `+=${dist() * HOLD}`;
    const sc = { trigger: stage, start: 'top top', end, scrub: 1, invalidateOnRefresh: true };
    const move = gsap.fromTo(track, { x: START }, { x: () => START() - dist(), ease, force3D: true, scrollTrigger: { ...sc, pin: true, anticipatePin: 1 } });
    gsap.fromTo(scope.querySelector('.rt__road'), { backgroundPositionX: '0px' }, { backgroundPositionX: () => `${-dist() * 1.1}px`, ease, scrollTrigger: sc });
    gsap.fromTo(scope.querySelector('.rt__city'), { x: 0 }, { x: () => -dist() * 0.32, ease, scrollTrigger: sc });
    scope.querySelectorAll('.rt__wheel').forEach((w) => {
      gsap.fromTo(w, { rotation: 0, svgOrigin: `${w.dataset.cx} 90` }, { rotation: () => dist() * 0.9, svgOrigin: `${w.dataset.cx} 90`, ease, scrollTrigger: sc });
    });
    scope.querySelectorAll('.bb__card').forEach((el) => {
      gsap.fromTo(el, { scale: 0.88, rotate: (i) => (Math.random() - 0.5) * 8 }, { scale: 1, rotate: 0, ease: 'power2.out', scrollTrigger: { trigger: el, containerAnimation: move, start: 'left 96%', end: 'left 52%', scrub: 1 } });
    });
  }, []);

  return (
    <section id="path" ref={root} className="rt" aria-labelledby="path-title">
      <div className="rt__stage">
        <header className="rt__head">
          <p className="label mono">( 05 — Path )</p>
          <h2 id="path-title" className="rt__h">Chapters so far.</h2>
        </header>
        <svg className="rt__city" viewBox="0 0 3600 420" preserveAspectRatio="xMinYMax slice" aria-hidden="true">
          <defs><pattern id="win" width="16" height="22" patternUnits="userSpaceOnUse"><rect x="5" y="5" width="6" height="9" fill="#ffd60a" opacity=".5" /></pattern></defs>
          {CITY.map((b, i) => (<g key={i}><rect x={b.x} y={420 - b.h} width={b.w} height={b.h} fill="#0d0c0b" opacity=".55" /><rect x={b.x} y={420 - b.h} width={b.w} height={b.h} fill="url(#win)" opacity=".6" />{b.tank && <g fill="#0d0c0b" opacity=".55"><rect x={b.x + b.w / 2 - 14} y={420 - b.h - 30} width="28" height="30" rx="4" /><path d={`M${b.x + b.w / 2 - 14} ${420 - b.h - 30} h28 l-14 -12z`} /></g>}</g>))}
        </svg>
        <ol className="rt__track">
          {path.map((s, i) => (
            <li className="bb" key={s.n} style={{ '--pole': `${5 + ((i * 7) % 4) * 4}vh` }}>
              <div className={`bb__card card--${s.tone}`}>
                <span className="tape bb__tape" aria-hidden="true" />
                <span className="bb__n" aria-hidden="true">{s.n}</span>
                <p className="bb__tag mono">{s.tag}{s.when ? ` · ${s.when}` : ''}</p>
                <h3>{s.title}</h3>
                <p className="bb__where">{s.where}</p>
                <p className="bb__text">{s.text}</p>
                <ul className="bb__chips">{s.chips.map((c) => <li key={c}>{c}</li>)}</ul>
                <div className="bb__vis">{VIS[s.vis]()}</div>
              </div>
              <span className="bb__pole" aria-hidden="true" />
            </li>
          ))}
        </ol>
        <div className="rt__road" aria-hidden="true" />
        <TaxiSide className="rt__taxi" />
      </div>
    </section>
  );
}
