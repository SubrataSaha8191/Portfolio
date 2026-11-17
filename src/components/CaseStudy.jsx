import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { pauseScroll, resumeScroll } from '../animation/smoothScroll';
import { projects } from '../data/content';
import ProjectVisual from './ProjectVisual';
import Magnetic from './Magnetic';

export default function CaseStudy({ id, onClose, onNavigate }) {
  const root = useRef(null);
  const closeBtn = useRef(null);
  const last = useRef(id);
  if (id) last.current = id;
  const idx = Math.max(0, projects.findIndex((q) => q.id === last.current));
  const p = projects[idx];
  const openRef = useRef(false);

  // open / close wipe
  useEffect(() => {
    const el = root.current;
    const reduced = prefersReducedMotion();
    if (id && !openRef.current) {
      openRef.current = true;
      pauseScroll();
      document.querySelector('main')?.setAttribute('inert', '');
      gsap.set(el, { visibility: 'visible' });
      gsap.fromTo(el, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: reduced ? 0.01 : 1, ease: 'expo.inOut', onComplete: () => closeBtn.current?.focus() });
      gsap.fromTo('.cs__in', { y: 60, opacity: 0 }, { y: 0, opacity: 1, duration: reduced ? 0.01 : 1, stagger: 0.07, delay: reduced ? 0 : 0.5 });
    } else if (!id && openRef.current) {
      openRef.current = false;
      gsap.to(el, {
        clipPath: 'inset(0 0 100% 0)', duration: reduced ? 0.01 : 0.8, ease: 'expo.inOut',
        onComplete: () => { gsap.set(el, { visibility: 'hidden' }); resumeScroll(); document.querySelector('main')?.removeAttribute('inert'); },
      });
    }
  }, [id]);

  // switching project: scroll panel to top and replay the entrance
  useEffect(() => {
    if (!id || !root.current) return;
    root.current.scrollTop = 0;
    gsap.fromTo('.cs__in', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: 0.8, stagger: 0.05, overwrite: 'auto' });
  }, [id]);

  useEffect(() => {
    if (!id) return;
    const key = (e) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'Tab') {
        const f = [...root.current.querySelectorAll('a,button')];
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [id, onClose]);

  const next = projects[(idx + 1) % projects.length];
  const prevP = projects[(idx - 1 + projects.length) % projects.length];

  return (
    <div ref={root} className="cs" role="dialog" aria-modal="true" aria-label={p ? `${p.title} case study` : 'Case study'} style={{ visibility: 'hidden' }} data-lenis-prevent>
      {p && (
        <div className="cs__wrap">
          <div className="cs__bar">
            <span className="mono">Case study {p.n} / 07</span>
            <button ref={closeBtn} className="cs__close mono" onClick={onClose}>Close ✕</button>
          </div>

          <div className="cs__grid">
            <div className="cs__main">
              <p className="cs__in mono cs__status"><i className="dot" /> {p.status}</p>
              <h2 className="cs__in cs__title">{p.title}</h2>
              <p className="cs__in cs__kicker">{p.kicker}</p>
              <p className="cs__in cs__summary">{p.summary}</p>

              <div className="cs__in cs__block">
                <h3 className="label mono">What's in it</h3>
                <ul className="cs__list">{p.approach.map((a) => <li key={a}>{a}</li>)}</ul>
              </div>
            </div>

            <div className="cs__side">
              <div className="cs__in cs__shot"><ProjectVisual project={p} /></div>
              {p.metric && (
                <div className="cs__in cs__metric">
                  <strong>{p.metric.value}</strong>
                  <span className="mono">{p.metric.label}</span>
                </div>
              )}
              <div className="cs__in cs__block">
                <h3 className="label mono">My part</h3>
                <p>{p.role}</p>
              </div>
              <div className="cs__in cs__block">
                <h3 className="label mono">Stack</h3>
                <ul className="tags">{p.stack.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className="cs__in cs__block cs__honest">
                <h3 className="label mono">Honest notes</h3>
                <p>{p.note}</p>
              </div>
              <div className="cs__in cs__links">
                {p.links.map((l) => (
                  <Magnetic as="a" key={l.href} href={l.href} target="_blank" rel="noopener noreferrer" className="btn" strength={0.2}>
                    {l.label} <span aria-hidden="true">↗</span>
                  </Magnetic>
                ))}
              </div>
            </div>
          </div>

          <nav className="cs__pager" aria-label="Other projects">
            <button onClick={() => onNavigate(prevP.id)} data-cursor="Prev"><span className="mono">← Previous</span><b>{prevP.title}</b></button>
            <button onClick={() => onNavigate(next.id)} data-cursor="Next"><span className="mono">Next →</span><b>{next.title}</b></button>
          </nav>
        </div>
      )}
    </div>
  );
}
