import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';
import { buildStencil } from '../art/stencil';
import { site } from '../data/content';

const CHAPTERS = [
  { n: '01', t: 'Understand', c: 'cy', body: `I'm a third-year B.Tech student in Computer Science and Engineering at ${site.school}. I want to know how things work: how a model is trained and judged, how it ends up behind a service, and what the operating system is doing underneath.` },
  { n: '02', t: 'Research', c: 'pk', body: 'I am drawn to the research-shaped questions: what actually holds up, and where it breaks. Most of what I publish has its limits written down, including what it does not do.' },
  { n: '03', t: 'Build', c: 'yl', body: "I work across the stack because the interesting problems sit at the seams. A classifier only matters once it has an API; an agent is only trustworthy once you know what it is allowed to run." },
];
const FACTS = [
  ['Studying', 'B.Tech CSE · third year'],
  ['Working on', 'ML · NLP & vision · RAG · agents'],
  ['Underneath', 'Linux · systems · security basics'],
  ['Writes in', 'Python · TS · Rust · C/C++ · Java'],
];

// the same scene is rendered twice: a faint copy that is always there, and the fluorescent copy that only the lamp reveals
function Scene({ lit, canvasRef }) {
  return (
    <div className={`bl__scene ${lit ? 'is-lit' : 'is-dim'}`} aria-hidden={lit ? undefined : 'true'}>
      <div className="bl__text">
        {CHAPTERS.map((c) => (
          <p className={`bl__chap bl__chap--${c.c}`} key={c.n}><b className="mono"><i>{c.n}</i> / {c.t}</b>{c.body}</p>
        ))}
        <ul className="bl__facts">
          {FACTS.map(([k, v]) => <li key={k}><span className="mono">{k}</span>{v}</li>)}
        </ul>
      </div>
      <figure className="bl__fig">
        <canvas ref={canvasRef} width="768" height="900" role={lit ? 'img' : undefined} aria-label={lit ? 'Spray-stencil portrait of Subrata Saha' : undefined} />
        <svg className="bl__doodle" viewBox="0 0 200 120" aria-hidden="true"><path d="M10 100 C40 20 100 10 150 40 M130 18 L152 42 L122 56" fill="none" strokeWidth="6" strokeLinecap="round" strokeLinejoin="round" /><path d="M170 90 l4 12 12 2 -10 8 3 12 -9 -7 -10 7 3 -12 -10 -8 12 -2z" fill="none" strokeWidth="4" strokeLinejoin="round" /></svg>
        <figcaption className="mono">fig. 01 · subject: Subrata Saha</figcaption>
      </figure>
    </div>
  );
}

/**
 * About is a blacklight room. The story is written in fluorescent paint that you can only see under UV: your cursor is
 * the lamp. Without a pointer (touch, keyboard, or just scrolling) the lamp sweeps the wall by itself as you scroll,
 * and when you reach the end the lights come on with a flicker. "Lights on" is also a real button.
 */
export default function About() {
  const root = useRef(null);
  const stageRef = useRef(null);
  const dimC = useRef(null);
  const litC = useRef(null);
  const [lights, setLights] = useState(false);
  const lightsRef = useRef(false);
  lightsRef.current = lights;

  useEffect(() => {
    let dead = false, t = 0;
    const go = () => buildStencil('/portrait.webp', 768, 900).then(({ stencil }) => {
      if (dead) return;
      [dimC.current, litC.current].forEach((c) => c && c.getContext('2d').drawImage(stencil, 0, 0));
    });
    // wait until the opening film is over (the page unlocks), then use an idle moment
    const start = () => { if (dead) return; if (window.requestIdleCallback) window.requestIdleCallback(go, { timeout: 4000 }); else t = setTimeout(go, 800); };
    const iv = setInterval(() => { if (!document.documentElement.classList.contains('is-loading')) { clearInterval(iv); t = setTimeout(start, 1500); } }, 300);
    return () => { dead = true; clearInterval(iv); clearTimeout(t); };
  }, []);

  useSection(root, ({ scope, cleanups }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); setLights(true); return; }
    const stage = stageRef.current;
    const lamp = { x: 0, y: 0, tx: 0, ty: 0, r: 0, tr: 250, last: 0, p: 0 };
    const rect = () => stage.getBoundingClientRect();
    let lx = -1, ly = -1, lr = -1;
    const setLamp = () => {
      if (Math.abs(lamp.x - lx) < 0.4 && Math.abs(lamp.y - ly) < 0.4 && Math.abs(lamp.r - lr) < 0.4) return;
      lx = lamp.x; ly = lamp.y; lr = lamp.r;
      stage.style.setProperty('--lx', `${lamp.x}px`);
      stage.style.setProperty('--ly', `${lamp.y}px`);
      stage.style.setProperty('--lr', `${lamp.r}px`);
    };
    const r0 = rect(); lamp.x = lamp.tx = r0.width * 0.2; lamp.y = lamp.ty = r0.height * 0.3; lamp.r = lamp.tr; setLamp();
    const onMove = (e) => { const r = rect(); lamp.tx = e.clientX - r.left; lamp.ty = e.clientY - r.top; lamp.last = performance.now(); };
    stage.addEventListener('pointermove', onMove);
    let live = false;
    const tick = () => {
      if (!live) return;
      const r = rect();
      // autopilot: a lamp sweeping the wall in rows, driven by scroll progress, whenever the pointer has been idle
      if (performance.now() - lamp.last > 1400) {
        const rows = 5, u = lamp.p * rows, row = Math.floor(Math.min(rows - 0.001, u)), f = u - row;
        lamp.tx = r.width * (row % 2 ? 1 - f : f) * 0.92 + r.width * 0.04;
        lamp.ty = r.height * (0.16 + (row / (rows - 1)) * 0.72);
      }
      lamp.x += (lamp.tx - lamp.x) * 0.18; lamp.y += (lamp.ty - lamp.y) * 0.18; lamp.r += (lamp.tr - lamp.r) * 0.1;
      setLamp();
    };
    gsap.ticker.add(tick);
    cleanups.push(() => { gsap.ticker.remove(tick); stage.removeEventListener('pointermove', onMove); });
    ScrollTrigger.create({
      trigger: scope.querySelector('.bl__stage'), start: 'top top', end: () => `+=${200}%`, pin: true, anticipatePin: 1,
      onToggle: (self) => { live = self.isActive; },
      onUpdate: (self) => {
        lamp.p = self.progress;
        const done = self.progress > 0.96;
        if (done !== lightsRef.current && !stage.dataset.manual) setLights(done);
      },
    });
    gsap.fromTo(scope.querySelector('.bl__head'), { yPercent: -60, opacity: 0, rotate: -4 }, { yPercent: 0, opacity: 1, rotate: 0, ease: 'power3.out', scrollTrigger: { trigger: scope, start: 'top 85%', end: 'top 35%', scrub: 0.7 } });
    gsap.fromTo(stage, { '--dark': 0 }, { '--dark': 1, ease: 'none', scrollTrigger: { trigger: scope, start: 'top 90%', end: 'top 20%', scrub: true } });
  }, []);

  const toggle = () => { if (stageRef.current) stageRef.current.dataset.manual = '1'; setLights((v) => !v); };

  return (
    <section id="about" ref={root} className="bl" aria-labelledby="about-title">
      <div ref={stageRef} className={`bl__stage ${lights ? 'is-on' : ''}`}>
        <header className="bl__head">
          <p className="label mono">( 03 — About )</p>
          <h2 id="about-title" className="bl__h">Who&apos;s behind the wall?</h2>
          <p className="bl__hint mono">{lights ? 'Lights are on.' : 'Move your light across the wall. Or just keep scrolling.'}</p>
        </header>
        <button className="sticker bl__switch" onClick={toggle} aria-pressed={lights} style={{ '--r': '2deg' }}>{lights ? 'Lights off' : 'Lights on'}</button>
        <Scene lit={false} canvasRef={dimC} />
        <Scene lit canvasRef={litC} />
        <i className="bl__beam" aria-hidden="true" />
      </div>
    </section>
  );
}
