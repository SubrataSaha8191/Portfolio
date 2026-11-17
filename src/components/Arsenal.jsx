import { useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { initReveals } from '../animation/reveals';
import { arsenal } from '../data/content';

const KEYS = ['def', '=>', 'fn', '#include', 'std::', 'class', 'async', 'impl', 'struct', 'import', 'type', 'let'];
const LINES = ['$ git switch -c feature/rag', '$ docker compose up -d', '$ cargo build --release', '$ python train.py --eval', '$ curl -s localhost:8000/docs', '$ sudo systemctl status facelock'];

const VISUALS = {
  lang: () => (
    <div className="v-lang" aria-hidden="true">
      {[0, 1, 2].map((r) => (
        <div className="v-lang__row" key={r} style={{ '--dir': r % 2 ? 1 : -1, '--spd': `${22 + r * 6}s` }}>
          {[...KEYS, ...KEYS].map((k, i) => <span key={i} className={(i + r) % 4 === 0 ? 'is-solid' : ''}>{k}</span>)}
        </div>
      ))}
    </div>
  ),
  ui: () => (
    <div className="v-ui" aria-hidden="true">
      <div className="v-ui__bar"><i /><i /><i /></div>
      <div className="v-ui__hero" />
      <div className="v-ui__row"><b /><b /><b /></div>
      <div className="v-ui__row v-ui__row--s"><b /><b /></div>
    </div>
  ),
  svc: () => (
    <svg className="v-svc" viewBox="0 0 320 220" aria-hidden="true">
      {[[40, 110, 'CLIENT'], [160, 50, 'API'], [160, 170, 'AUTH'], [280, 110, 'DB']].map(([x, y, t]) => (
        <g key={t}><rect x={x - 34} y={y - 16} width="68" height="32" rx="8" fill="none" stroke="currentColor" strokeWidth="2" /><text x={x} y={y + 4} textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="10" fill="currentColor">{t}</text></g>
      ))}
      {['M74 104 L126 58', 'M74 116 L126 162', 'M194 54 L246 104', 'M194 166 L246 116'].map((d, i) => (
        <path key={i} d={d} stroke="currentColor" strokeWidth="2" fill="none" strokeDasharray="5 6" className="v-svc__flow" style={{ animationDelay: `${i * 0.25}s` }} />
      ))}
      <circle r="5" fill="currentColor"><animateMotion dur="3.2s" repeatCount="indefinite" path="M74 104 L126 58 L194 54 L246 104" /></circle>
      <circle r="5" fill="currentColor"><animateMotion dur="3.2s" begin="1.6s" repeatCount="indefinite" path="M246 116 L194 166 L126 162 L74 116" /></circle>
    </svg>
  ),
  ai: () => (
    <div className="v-ai" aria-hidden="true">
      {Array.from({ length: 54 }, (_, i) => <i key={i} style={{ '--d': `${((i % 9) + Math.floor(i / 9)) * 0.14}s` }} />)}
    </div>
  ),
  env: () => (
    <div className="v-env" aria-hidden="true">
      <div className="v-env__bar"><i /><i /><i /></div>
      <div className="v-env__body">
        {LINES.map((l, i) => <p key={l} style={{ '--i': i }}>{l}</p>)}
        <p className="v-env__cur">$ <span /></p>
      </div>
    </div>
  ),
};
const VARIANT = { lang: 'lime', ui: 'ink', svc: 'orange', ai: 'dark', env: 'night' };

/**
 * Arsenal is a deck: five cards stacked in one place. While pinned, each next card rises from
 * below and buries the previous one, which shrinks and dims behind it. The 3D slab stack on the
 * right follows whichever card is on top.
 */
export default function Arsenal() {
  const root = useRef(null);
  const [on, setOn] = useState(0);

  useSection(root, ({ cleanups, scope }) => {
    initReveals(scope, cleanups);
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const cards = scope.querySelectorAll('.card');
    const n = cards.length;
    gsap.set(cards, { yPercent: (i) => (i === 0 ? 0 : 118) });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: {
        trigger: scope.querySelector('.arsenal__stage'), start: 'top top', end: () => `+=${n * 60}%`, pin: true, scrub: 0.7, anticipatePin: 1,
        onUpdate: (self) => setOn(Math.min(n - 1, Math.floor(self.progress * n * 0.999))),
      },
    });
    cards.forEach((c, i) => {
      if (i === 0) return;
      tl.to(c, { yPercent: 0, duration: 1, ease: 'power3.inOut' }, i - 1)
        .to(cards[i - 1], { scale: 0.9, yPercent: -7, opacity: 0.3, duration: 1, ease: 'power2.inOut' }, i - 1);
    });
    tl.to({}, { duration: 0.3 });
    gsap.fromTo(scope.querySelector('.stack'), { yPercent: 40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: scope, start: 'top 90%', end: 'top 30%', scrub: true } });
  }, []);

  return (
    <section id="arsenal" ref={root} className="arsenal" aria-labelledby="arsenal-title">
      <span className="bgword" data-dir="r" aria-hidden="true">Stack</span>
      <div className="arsenal__stage">
        <div className="wrap">
          <header className="sect-head">
            <p className="label mono" data-reveal>( 04 — Technical arsenal )</p>
            <h2 id="arsenal-title" className="display" data-split data-fx="wave">Tools, by the layer they serve.</h2>
          </header>
          <div className="arsenal__grid">
            <div className="deck">
              {arsenal.map((a, i) => (
                <article className={`card card--${VARIANT[a.id]} ${on === i ? 'is-top' : ''}`} key={a.id} style={{ zIndex: i + 1 }} aria-label={a.title}>
                  <span className="card__big" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
                  <div className="card__main">
                    <p className="card__n mono">{String(i + 1).padStart(2, '0')} / {String(arsenal.length).padStart(2, '0')} · {a.note}</p>
                    <h3>{a.title}</h3>
                    <ul className="tags tags--big">{a.tools.map((t, k) => <li key={t} style={{ '--k': k }}>{t}</li>)}</ul>
                  </div>
                  <div className="card__vis">{VISUALS[a.id]()}</div>
                </article>
              ))}
            </div>
            <div className="stack" aria-hidden="true">
              <div className="stack__plate">
                {[...arsenal].reverse().map((a, ri) => {
                  const i = arsenal.length - 1 - ri;
                  return (
                    <div key={a.id} className={`slab ${on === i ? 'is-on' : ''}`} style={{ '--z': ri }}>
                      <span className="mono">{a.title}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
