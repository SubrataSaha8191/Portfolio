import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { useSection } from '../hooks/useSection';

// Original take on a mixed-direction scroll scene: three giant rows arrive on three different
// trajectories (vertical drop, diagonal from top-left, diagonal from bottom-right) and then all
// resolve into slow horizontal drifts before the scene zooms away.
const ROWS = [
  { t: 'Models', cap: 'trained, evaluated, judged', mode: 'down', cls: '' },
  { t: 'Services', cap: 'wrapped in APIs, agents and queues', mode: 'diagdown', cls: 'is-out' },
  { t: 'Linux.', cap: 'down to PAM, systemd and sockets', mode: 'diagup', cls: 'is-lime' },
];
const FROM = {
  down: { x: 0, y: '-125vh' },
  diagdown: { x: '-95vw', y: '-105vh' },
  diagup: { x: '95vw', y: '105vh' },
};
const DRIFT = ['-12vw', '14vw', '-9vw'];

export default function Giant() {
  const root = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const rows = scope.querySelectorAll('.giant__row');
    const splits = [...rows].map((r) => splitText(r.querySelector('.giant__word'), 'chars'));
    splits.forEach((s) => cleanups.push(s.revert));

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scope.querySelector('.giant__canvas'), start: 'top top', end: '+=450%', pin: true, scrub: 0.9, anticipatePin: 1 },
    });
    gsap.set('.giant__label', { opacity: 0, y: 20 });
    rows.forEach((row, i) => {
      const f = FROM[ROWS[i].mode];
      gsap.set(row, { x: f.x, y: f.y, rotate: ROWS[i].mode === 'down' ? 0 : ROWS[i].mode === 'diagdown' ? -12 : 12 });
      gsap.set(row.querySelector('.giant__cap'), { opacity: 0, y: 14 });
      const at = i * 0.55;
      tl.to(row, { x: 0, y: 0, rotate: 0, duration: 1.1, ease: 'power3.out' }, at)
        .fromTo(splits[i].chars, { rotate: () => gsap.utils.random(-35, 35), yPercent: 40 }, { rotate: 0, yPercent: 0, stagger: 0.04, duration: 0.8, ease: 'back.out(2)' }, at + 0.3)
        .to(row.querySelector('.giant__cap'), { opacity: 1, y: 0, duration: 0.4, ease: 'power2.out' }, at + 0.9);
    });
    tl.to('.giant__label', { opacity: 1, y: 0, duration: 0.4 }, 0.2);
    // phase B: everything slides horizontally, each row its own direction
    rows.forEach((row, i) => tl.to(row, { x: DRIFT[i], duration: 2.4 }, 2.0));
    tl.to('.giant__bar', { scaleX: 1, duration: 2.4 }, 2.0);
    // phase C: zoom away
    tl.to('.giant__bar, .giant__label', { opacity: 0, duration: 0.5 }, 4.5)
      .to('.giant__rows', { scale: 1.7, opacity: 0, transformOrigin: '50% 50%', duration: 0.8, ease: 'power2.in' }, 4.6)
      .to({}, { duration: 0.1 });
  }, []);

  return (
    <section ref={root} className="giant" aria-label="How I work: from models, to services, to Linux">
      <div className="giant__canvas">
        <p className="giant__label mono">( From the top of the stack to the bottom )</p>
        <div className="giant__rows">
          {ROWS.map((r) => (
            <div className={`giant__row ${r.cls}`} key={r.t}>
              <h2 className="giant__word">{r.t}</h2>
              <p className="giant__cap mono">{r.cap}</p>
            </div>
          ))}
        </div>
        <i className="giant__bar" aria-hidden="true" />
      </div>
    </section>
  );
}
