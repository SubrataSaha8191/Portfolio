import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { initReveals } from '../animation/reveals';
import { domains, projects } from '../data/content';
import { diagrams } from '../gl/labDiagrams';

function LabCanvas({ mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const reduced = prefersReducedMotion();
    let raf, vis = false;
    const t0 = performance.now();
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const r = c.getBoundingClientRect();
      c.width = r.width * dpr; c.height = r.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0 });
    io.observe(c);
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!vis || document.hidden) return;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      diagrams[mode](ctx, w, h, reduced ? 4 : (now - t0) / 1000);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [mode]);
  return <canvas ref={ref} className="lab__canvas" role="img" aria-label={`Illustrative diagram: ${mode}`} />;
}

/**
 * Lab is a horizontal gallery: while the section is pinned, scrolling down pulls six panels
 * sideways. Each panel's giant numeral drifts at its own speed (containerAnimation parallax).
 */
export default function Lab({ onOpen }) {
  const root = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    initReveals(scope, cleanups);
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const mm = gsap.matchMedia();
    mm.add('(min-width: 0px)', () => {
      const stage = scope.querySelector('.lab__stage');
      const track = scope.querySelector('.lab__track');
      const dist = () => track.scrollWidth - window.innerWidth;
      const move = gsap.to(track, {
        x: () => -dist(), ease: 'none',
        scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${dist()}`, pin: true, scrub: 0.8, anticipatePin: 1, invalidateOnRefresh: true },
      });
      scope.querySelectorAll('.lab__panel').forEach((panel) => {
        gsap.fromTo(panel.querySelector('.lab__big'), { xPercent: 40 }, { xPercent: -40, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left right', end: 'right left', scrub: true } });
        gsap.fromTo(panel.querySelector('.lab__pviz'), { yPercent: 14, opacity: 0.2 }, { yPercent: 0, opacity: 1, ease: 'none', scrollTrigger: { trigger: panel, containerAnimation: move, start: 'left 95%', end: 'left 45%', scrub: true } });
      });
      gsap.fromTo('.lab__prog i', { scaleX: 0 }, { scaleX: 1, ease: 'none', scrollTrigger: { trigger: stage, start: 'top top', end: () => `+=${dist()}`, scrub: true, invalidateOnRefresh: true } });
    });
    cleanups.push(() => mm.revert());
  }, []);

  return (
    <section id="lab" ref={root} className="lab" aria-labelledby="lab-title">
      <div className="lab__stage">
        <header className="lab__head wrap">
          <p className="label mono">( 02 — Engineering lab )</p>
          <h2 id="lab-title" className="display lab__h" data-split="words" data-fx="flip">Across the layers.</h2>
          <p className="lab__hint mono" aria-hidden="true">Keep scrolling → six layers</p>
        </header>
        <div className="lab__track">
          {domains.map((d, i) => (
            <article className="lab__panel" key={d.id} aria-label={d.title}>
              <span className="lab__big" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
              <div className="lab__pcopy">
                <p className="mono lab__pn">{String(i + 1).padStart(2, '0')} / {String(domains.length).padStart(2, '0')}</p>
                <h3>{d.title}</h3>
                <p className="lab__text">{d.text}</p>
                <ul className="tags">{d.tools.map((t) => <li key={t}>{t}</li>)}</ul>
                <p className="lab__proj mono">
                  <span>Seen in:</span>
                  {d.projects.map((id) => (
                    <button key={id} onClick={() => onOpen(id)} data-cursor="Open">{projects.find((p) => p.id === id).title}</button>
                  ))}
                </p>
              </div>
              <div className="lab__pviz">
                <p className="lab__bar mono" aria-hidden="true"><span>fig. {String(i + 1).padStart(2, '0')}</span><span>illustrative</span></p>
                <LabCanvas mode={d.id} />
              </div>
            </article>
          ))}
        </div>
        <div className="lab__prog" aria-hidden="true"><i /></div>
      </div>
    </section>
  );
}
