import { useEffect, useRef, useState } from 'react';
import { gsap, prefersReducedMotion, isCoarse } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { initReveals } from '../animation/reveals';
import { projects } from '../data/content';
import ProjectVisual from './ProjectVisual';

function Roll({ text }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((c, i) => (
        <span className="roll__c" key={i} style={{ '--i': i }}>
          <span>{c === ' ' ? ' ' : c}</span>
          <span>{c === ' ' ? ' ' : c}</span>
        </span>
      ))}
    </span>
  );
}

export default function Work({ onOpen }) {
  const root = useRef(null);
  const preview = useRef(null);
  const [active, setActive] = useState(-1);
  const prev = useRef(-1);
  const pt = useRef({ x: -1, y: -1 });
  const coarse = useRef(isCoarse());

  useSection(root, ({ cleanups, scope }) => {
    initReveals(scope, cleanups);
    if (prefersReducedMotion()) return;
    gsap.utils.toArray('.row__title').forEach((el, i) => {
      gsap.fromTo(el, { xPercent: i % 2 ? 14 : -14 }, { xPercent: 0, ease: 'none', scrollTrigger: { trigger: el, start: 'top bottom', end: 'top 55%', scrub: true } });
    });
    gsap.fromTo(
      '.row',
      { yPercent: 40, opacity: 0 },
      { yPercent: 0, opacity: 1, duration: 1, stagger: 0.07, scrollTrigger: { trigger: '.work__list', start: 'top 85%' } }
    );
  }, []);

  // The preview follows the pointer (lag + velocity tilt). Pointer tracking is global, and the row under the
  // cursor is re-probed ~every 70ms while the list is on screen, because smooth scrolling moves rows under a
  // still cursor without firing any pointer events.
  useEffect(() => {
    if (coarse.current) return;
    const el = preview.current;
    const list = root.current.querySelector('.work__list');
    const xTo = gsap.quickTo(el, 'x', { duration: 0.7, ease: 'power3' });
    const yTo = gsap.quickTo(el, 'y', { duration: 0.7, ease: 'power3' });
    const rTo = gsap.quickTo(el, 'rotation', { duration: 0.6, ease: 'power3' });
    let lastX = 0;
    const move = (e) => {
      pt.current.x = e.clientX; pt.current.y = e.clientY;
      const dx = e.clientX - lastX;
      lastX = e.clientX;
      xTo(e.clientX);
      yTo(e.clientY);
      rTo(gsap.utils.clamp(-9, 9, dx * 0.35));
    };
    const probe = () => {
      const { x, y } = pt.current;
      if (x < 0) return;
      const r = list.getBoundingClientRect();
      let idx = -1;
      if (y >= r.top && y <= r.bottom) {
        const row = document.elementFromPoint(x, y)?.closest('.row');
        idx = row ? [...list.children].indexOf(row) : -1;
      }
      setActive((a) => (a === idx ? a : idx));
    };
    let inView = false;
    const io = new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) probe(); }, { threshold: 0 });
    io.observe(list);
    let acc = 0;
    const tick = (time, dt) => {
      if (!inView) return;
      acc += dt;
      if (acc < 70) return;
      acc = 0;
      probe();
    };
    window.addEventListener('pointermove', move, { passive: true });
    gsap.ticker.add(tick);
    return () => { window.removeEventListener('pointermove', move); gsap.ticker.remove(tick); io.disconnect(); };
  }, []);

  // swap preview image with a directional clip wipe
  useEffect(() => {
    const el = preview.current;
    if (!el || coarse.current) return;
    const items = el.querySelectorAll('.preview__item');
    const from = prev.current;
    prev.current = active;
    if (active < 0) {
      gsap.to(el, { scale: 0.7, opacity: 0, duration: 0.45, ease: 'power3.in', overwrite: 'auto' });
      return;
    }
    const down = active > from;
    // appearing fresh (e.g. rows scrolled under a resting cursor): start exactly at the cursor, not at a stale spot
    if (from < 0 && pt.current.x >= 0) gsap.set(el, { x: pt.current.x, y: pt.current.y, rotation: 0 });
    gsap.to(el, { scale: 1, opacity: 1, duration: 0.7, ease: 'expo.out', overwrite: 'auto' });
    gsap.set(items[active], { zIndex: 2 });
    gsap.fromTo(items[active], { clipPath: down ? 'inset(100% 0 0 0)' : 'inset(0 0 100% 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, ease: 'expo.out' });
    gsap.fromTo(items[active].firstElementChild, { scale: 1.3 }, { scale: 1, duration: 1.2, ease: 'expo.out' });
    if (from >= 0) gsap.set(items[from], { zIndex: 1 });
  }, [active]);

  return (
    <section id="work" ref={root} className="work" aria-labelledby="work-title">
      <span className="bgword" aria-hidden="true">Selected work</span>
      <div className="wrap">
        <header className="sect-head">
          <p className="label mono" data-reveal>( 01 — Selected work )</p>
          <h2 id="work-title" className="display" data-split data-fx="fall">Seven projects, real limits.</h2>
          <p className="sect-head__aside" data-reveal>Hover to preview. Open any row for what it does, what I contributed, and what it doesn't do.</p>
        </header>

        <ul className="work__list" onPointerLeave={() => setActive(-1)}>
          {projects.map((p, i) => (
            <li key={p.id} className={`row ${active === i ? 'is-active' : ''} ${active >= 0 && active !== i ? 'is-dim' : ''}`}>
              <button
                className="row__btn"
                onClick={() => onOpen(p.id)}
                onPointerEnter={() => setActive(i)}
                onFocus={() => setActive(i)}
                onBlur={() => setActive(-1)}
                data-cursor="Open"
                aria-label={`${p.title}: ${p.kicker}. Open case study`}
              >
                <span className="row__n mono">{p.n}</span>
                <span className="row__title"><Roll text={p.title} /></span>
                <span className="row__kicker">{p.kicker}</span>
                <span className="row__tags mono">{p.tags.join(' / ')}</span>
                <span className="row__arrow" aria-hidden="true">↗</span>
                {coarse.current && <ProjectVisual project={p} className="row__thumb" />}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div ref={preview} className="preview" aria-hidden="true">
        {projects.map((p) => (
          <div className="preview__item" key={p.id}>
            <ProjectVisual project={p} />
          </div>
        ))}
        <span className="preview__chip mono">{active >= 0 ? projects[active].status : ''}</span>
      </div>
    </section>
  );
}
