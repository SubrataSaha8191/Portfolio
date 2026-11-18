import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { domains, projects } from '../data/content';
import { diagrams } from '../gl/labDiagrams';
import Logo from './Logo';

function LabCanvas({ mode }) {
  const ref = useRef(null);
  useEffect(() => {
    const c = ref.current;
    const ctx = c.getContext('2d');
    const reduced = prefersReducedMotion();
    let raf, vis = false;
    const t0 = performance.now();
    const fit = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 1.5);
      c.width = c.clientWidth * dpr; c.height = c.clientHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    fit();
    const ro = new ResizeObserver(fit); ro.observe(c);
    const io = new IntersectionObserver(([e]) => { vis = e.isIntersecting; }, { threshold: 0 });
    io.observe(c);
    let lastT = 0;
    const frame = (now) => {
      raf = requestAnimationFrame(frame);
      if (!vis || document.hidden || now - lastT < 32) return; // ~30fps is plenty for slow diagrams
      lastT = now;
      const w = c.clientWidth, h = c.clientHeight;
      ctx.clearRect(0, 0, w, h);
      diagrams[mode](ctx, w, h, reduced ? 4 : (now - t0) / 1000);
    };
    raf = requestAnimationFrame(frame);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); io.disconnect(); };
  }, [mode]);
  return <canvas ref={ref} className="lab__canvas" role="img" aria-label={`Illustrative diagram: ${mode}`} />;
}

const TONE = ['paper', 'yellow', 'cyan', 'pink', 'red', 'paper'];
const ROT = [-2.4, 2.1, -1.6, 2.6, -2, 1.6];

/**
 * Lab is a wheat-paste wall. Six layers, six torn-paper posters. While the section is pinned each poster
 * is slapped onto the wall (big, tilted, bouncing into place); the previous one shrinks into a pile along
 * the bottom edge, so by the end the wall is covered in everything you've scrolled past.
 */
export default function Lab({ onOpen }) {
  const root = useRef(null);

  useSection(root, ({ scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const posts = [...scope.querySelectorAll('.pst')];
    const n = posts.length;
    gsap.set(posts, { xPercent: -50, yPercent: -50, opacity: 0 });
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scope.querySelector('.lab__stage'), start: 'top top', end: () => `+=${n * 85}%`, pin: true, scrub: 0.7, anticipatePin: 1 },
    });
    posts.forEach((p, i) => {
      tl.fromTo(p, { opacity: 0, scale: 1.8, rotate: i % 2 ? 18 : -18, y: '-42vh' }, { opacity: 1, scale: 1, rotate: ROT[i], y: 0, duration: 0.55, ease: 'back.out(1.5)' }, i);
      if (i > 0) tl.to(posts[i - 1], { x: `${(i - 1 - 2) * 18.5}vw`, y: '31vh', scale: 0.22, rotate: ROT[i - 1] * 2.2, duration: 0.55, ease: 'power3.inOut' }, i);
    });
    tl.to({}, { duration: 0.5 });
    gsap.fromTo('.lab__head', { yPercent: -40, opacity: 0 }, { yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: scope, start: 'top 85%', end: 'top 35%', scrub: 0.7 } });
  }, []);

  return (
    <section id="lab" ref={root} className="lab" aria-labelledby="lab-title">
      <div className="lab__stage">
        <header className="lab__head">
          <p className="label mono">( 02 — Engineering lab )</p>
          <h2 id="lab-title" className="lab__h">Across the layers.</h2>
          <p className="lab__hint mono" aria-hidden="true">Each layer gets pasted on the wall ↓</p>
        </header>
        {domains.map((d, i) => (
          <article key={d.id} className={`pst pst--${TONE[i]}`} aria-label={d.title}>
            <span className="tape pst__tape" aria-hidden="true" />
            <span className="pst__big" aria-hidden="true">{String(i + 1).padStart(2, '0')}</span>
            <div className="pst__copy">
              <p className="mono pst__n">Layer {String(i + 1).padStart(2, '0')} / {String(domains.length).padStart(2, '0')}</p>
              <h3>{d.title}</h3>
              <p className="pst__text">{d.text}</p>
              <ul className="pst__chips">{d.tools.map((t) => <li key={t}><Logo name={t} />{t}</li>)}</ul>
              <p className="pst__proj mono">
                <span>Seen in →</span>
                {d.projects.map((id) => (
                  <button key={id} onClick={() => onOpen(id)} className="pst__link">{projects.find((p) => p.id === id).title}</button>
                ))}
              </p>
            </div>
            <div className="pst__viz">
              <p className="pst__bar mono" aria-hidden="true"><span>fig. {String(i + 1).padStart(2, '0')}</span><span>illustrative</span></p>
              <LabCanvas mode={d.id} />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
