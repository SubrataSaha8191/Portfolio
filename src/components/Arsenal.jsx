import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animation/gsap';
import { scrollToTarget } from '../animation/smoothScroll';
import { useSection } from '../hooks/useSection';
import { arsenal } from '../data/content';
import Logo from './Logo';

const COL = { lang: '#ff3b1d', ui: '#ffd60a', svc: '#11b5e4', ai: '#ff4fa3', env: '#efe8d6' };
const rot = (k, on) => (((k * 37 + on * 11) % 13) - 6) * 0.9;
const off = (k, on) => (((k * 53 + on * 7) % 5) - 2) * 6;

function RackCan({ color, label, n }) {
  return (
    <svg viewBox="0 0 100 210" className="rk__svg" aria-hidden="true" focusable="false">
      <rect x="40" y="2" width="20" height="16" rx="4" fill="#0d0c0b" />
      <rect x="28" y="14" width="44" height="26" rx="8" fill="#efe8d6" stroke="#0d0c0b" strokeWidth="4" />
      <path d="M14 52 Q14 34 50 34 Q86 34 86 52 V190 Q86 204 72 204 H28 Q14 204 14 190 Z" fill={color} stroke="#0d0c0b" strokeWidth="4.5" />
      <rect x="14" y="98" width="72" height="52" fill="#efe8d6" stroke="#0d0c0b" strokeWidth="4" />
      <text x="50" y="120" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="9" fill="#0d0c0b">{n}</text>
      <text x="50" y="142" textAnchor="middle" fontFamily="Anton, Impact, sans-serif" fontSize={label.length > 12 ? 8.5 : label.length > 9 ? 10.5 : 13} fill="#0d0c0b" letterSpacing="0.5">{label}</text>
      <rect x="24" y="60" width="9" height="30" rx="4.5" fill="#fff" opacity=".4" />
      <path d="M30 204 V214 M62 204 V210" stroke={color} strokeWidth="5" strokeLinecap="round" />
    </svg>
  );
}

/**
 * Arsenal is a rack of five spray cans, one per layer. While pinned, scrolling picks up the next can: it
 * lifts, shakes, and sprays its tools onto the wall as stickers in its own colour (and the old ones are
 * painted over). Cans are also real buttons, so mouse and keyboard users can pick any layer directly.
 */
export default function Arsenal() {
  const root = useRef(null);
  const [on, setOn] = useState(0);
  const st = useRef(null);

  useSection(root, ({ scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const n = arsenal.length;
    st.current = ScrollTrigger.create({
      trigger: scope.querySelector('.rk__stage'), start: 'top top', end: () => `+=${n * 60}%`, pin: true, anticipatePin: 1,
      onUpdate: (self) => setOn(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
    });
    gsap.fromTo(scope.querySelectorAll('.rk__can'), { yPercent: 120, rotate: (i) => (i % 2 ? 14 : -14) }, { yPercent: 0, rotate: 0, stagger: 0.07, ease: 'back.out(1.6)', scrollTrigger: { trigger: scope, start: 'top 85%', end: 'top 30%', scrub: 0.8 } });
  }, []);

  const pick = (i) => {
    const s = st.current;
    if (!s) return setOn(i);
    scrollToTarget(s.start + ((i + 0.5) / arsenal.length) * (s.end - s.start), { duration: 1.1 });
  };

  const a = arsenal[on];
  const c = COL[a.id];
  return (
    <section id="arsenal" ref={root} className="arsenal" aria-labelledby="arsenal-title">
      <div className="rk__stage" style={{ '--c': c }}>
        <header className="rk__head">
          <p className="label mono">( 04 — Technical arsenal )</p>
          <h2 id="arsenal-title" className="rk__h">Tools, by the layer they serve.</h2>
        </header>
        <div className="rk__wall" aria-live="polite">
          <i className="rk__splat" key={`s${on}`} aria-hidden="true" />
          <p className="rk__layer mono" key={`l${on}`}>{String(on + 1).padStart(2, '0')} / {String(arsenal.length).padStart(2, '0')} · {a.title} · {a.note}</p>
          <ul className="rk__chips" key={`c${on}`} data-n={a.tools.length}>
            {a.tools.map((t, k) => <li key={t} style={{ '--k': k, '--r': `${rot(k, on)}deg`, '--dy': `${off(k, on)}px` }}><Logo name={t} />{t}</li>)}
          </ul>
        </div>
        <div className="rk__rack" role="group" aria-label="Choose a layer">
          {arsenal.map((x, i) => (
            <button key={x.id} className={`rk__can ${on === i ? 'is-on' : ''}`} onClick={() => pick(i)} aria-pressed={on === i} aria-label={`${x.title}: ${x.tools.join(', ')}`}>
              <span className="rk__mist" aria-hidden="true">{[0, 1, 2, 3, 4, 5].map((m) => <i key={m} style={{ '--m': m, background: COL[x.id] }} />)}</span>
              <RackCan color={COL[x.id]} label={x.title.toUpperCase()} n={String(i + 1).padStart(2, '0')} />
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
