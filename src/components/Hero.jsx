import { useEffect, useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { motion } from '../animation/state';
import { scrollToTarget } from '../animation/smoothScroll';
import { useSection } from '../hooks/useSection';
import { site, projects } from '../data/content';
import HeroNet from './HeroNet';

const TERM = ['$ python train.py --target safety', '✓ saved trained_models/tourism_safety.pkl', '$ cargo run --release   # OMEN', '$ docker compose up -d', '$ curl localhost:8000/docs'];
const LIVE = projects.filter((p) => p.links.some((l) => l.label === 'Live')).length;

export default function Hero({ introGate, pointCount }) {
  const root = useRef(null);
  const hud = useRef(null);
  const intro = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    const reduced = prefersReducedMotion();
    const lines = [...scope.querySelectorAll('.hero__line')];
    const splits = lines.map((l) => splitText(l, 'chars'));
    splits.forEach((s) => cleanups.push(s.revert));
    const chars = splits.flatMap((s) => s.chars);
    const stmt = splitText(scope.querySelector('.hero__statement'), 'words');
    cleanups.push(stmt.revert);
    const live = { on: false };

    if (!reduced) {
      // Each line has its own entrance as the loader opens:
      // 1 falls from above and lands, 2 sweeps in from the right, 3 flips up in 3D.
      gsap.set(splits[0].chars, { yPercent: -130, scaleY: 1.7, transformOrigin: '50% 100%' });
      gsap.set(lines[1], { x: '65vw', skewX: -24, opacity: 0 });
      gsap.set(splits[2].chars, { rotationX: -100, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 800 });
      gsap.set('.hero__lens', { scale: 0, rotation: -300 });
      gsap.set(stmt.words, { yPercent: 115 });
      gsap.set('.hero__eyebrow', { clipPath: 'inset(0 100% 0 0)' });
      gsap.set('.hero__fade', { opacity: 0, y: 24 });
      gsap.set('.hero__glow i', { scaleY: 0.55, opacity: 0, transformOrigin: '50% 100%' });

      const counter = scope.querySelector('.hero__count');
      const total = Number(counter?.dataset.n || 0);
      const count = { v: 0 };

      intro.current = gsap
        .timeline({ paused: true, onComplete: () => { live.on = true; } })
        .to('.hero__glow i', { scaleY: 1, opacity: 1, duration: 2.2, ease: 'expo.out' }, 0)
        .to(splits[0].chars, { yPercent: 0, scaleY: 1, duration: 1.1, stagger: 0.05, ease: 'bounce.out' }, 0.05)
        .to(lines[1], { x: 0, skewX: 0, opacity: 1, duration: 1.3, ease: 'expo.out' }, 0.35)
        .to(splits[2].chars, { rotationX: 0, opacity: 1, duration: 1.0, stagger: { each: 0.06, from: 'edges' }, ease: 'back.out(1.8)' }, 0.7)
        .to('.hero__fade', { opacity: 1, y: 0, duration: 1, stagger: 0.1 }, 0.5)
        .to('.hero__eyebrow', { clipPath: 'inset(-4px 0% -4px 0)', duration: 1.4, ease: 'expo.inOut' }, 0.6)
        .to(stmt.words, { yPercent: 0, duration: 1.1, stagger: 0.07, ease: 'expo.out' }, 0.9)
        .to('.hero__lens', { scale: 1, rotation: 0, duration: 1.6, ease: 'expo.out' }, 1.1);
      if (counter && total) {
        const label = counter.textContent;
        intro.current.to(
          count,
          { v: total, duration: 1.8, ease: 'power2.out', onUpdate: () => { counter.textContent = `${Math.round(count.v).toLocaleString()} points · 1 photograph`; }, onComplete: () => { counter.textContent = label; } },
          0.8
        );
      }

      // alive after the intro: a skew shimmer sweeps through the headline every few seconds ...
      const shimmer = gsap.timeline({ repeat: -1, repeatDelay: 4.5, delay: 6 });
      shimmer.to(chars, { skewX: -9, duration: 0.45, ease: 'sine.inOut', stagger: 0.035, yoyo: true, repeat: 1 });
      cleanups.push(() => shimmer.kill());

      // ... and the letters lift toward the cursor (magnetic type)
      if (!window.matchMedia('(hover: none)').matches) {
        const mp = { x: -9999, y: -9999 };
        const mv = (e) => { mp.x = e.clientX; mp.y = e.clientY; };
        window.addEventListener('pointermove', mv, { passive: true });
        const cur = chars.map(() => ({ y: 0, s: 1 }));
        const tick = () => {
          if (!live.on || window.scrollY > window.innerHeight * 1.1) return;
          chars.forEach((c, i) => {
            const r = c.getBoundingClientRect();
            const d = Math.hypot(mp.x - (r.left + r.width / 2), mp.y - (r.top + r.height / 2));
            const k = Math.max(0, 1 - d / 240);
            const st = cur[i];
            st.y += (-k * k * 34 - st.y) * 0.12;
            st.s += (1 + k * 0.1 - st.s) * 0.12;
            if (Math.abs(st.y) > 0.05 || Math.abs(st.s - 1) > 0.001) gsap.set(c, { y: st.y, scaleY: st.s, transformOrigin: '50% 100%' });
          });
        };
        gsap.ticker.add(tick);
        cleanups.push(() => { gsap.ticker.remove(tick); window.removeEventListener('pointermove', mv); });
      }
    }

    // scroll: the identity breaks apart as the portrait disperses into the field.
    // (Scroll tweens use properties the intro does not touch, so they never fight.)
    const tl = gsap.timeline({
      scrollTrigger: { trigger: scope, start: 'top top', end: '+=140%', pin: true, scrub: 0.6, anticipatePin: 1 },
      defaults: { ease: 'none' },
    });
    const fx = { immediateRender: false };
    scope.querySelectorAll('.hero__fade').forEach((el, i) => tl.fromTo(el, { filter: 'opacity(1)', yPercent: 0 }, { filter: 'opacity(0)', yPercent: -40, duration: 0.3, ...fx }, i * 0.04));
    tl.fromTo(lines[0], { xPercent: 0, yPercent: 0, scaleY: 1 }, { xPercent: -14, yPercent: -90, scaleY: 1.4, transformOrigin: '50% 100%', duration: 0.7, ...fx }, 0.1)
      .fromTo(lines[1], { xPercent: 0, yPercent: 0, scaleY: 1 }, { xPercent: 9, yPercent: -90, scaleY: 1.4, transformOrigin: '50% 100%', duration: 0.7, ...fx }, 0.18)
      .fromTo(lines[2], { xPercent: 0, yPercent: 0, scaleY: 1 }, { xPercent: -6, yPercent: -90, scaleY: 1.4, transformOrigin: '50% 100%', duration: 0.7, ...fx }, 0.26)
      .fromTo('.hero__glow', { opacity: 1 }, { opacity: 0, duration: 0.4, ...fx }, 0)
      .fromTo(motion, { disperse: 0 }, { disperse: 1, duration: 0.9, ...fx }, 0.05)
      .fromTo('.gl-canvas, .gl-fallback', { opacity: 1 }, { opacity: 0.55, duration: 0.5, ...fx }, 0.5)
      .fromTo('.hero__cue', { opacity: 1 }, { opacity: 0, duration: 0.1, ...fx }, 0)
      .to({}, { duration: 0.15 });
  }, []);

  useEffect(() => {
    if (introGate && intro.current) intro.current.play();
  }, [introGate]);

  // live pointer readout, written straight to the DOM (no React re-render)
  useEffect(() => {
    const el = hud.current;
    if (!el) return;
    const mv = (e) => {
      el.textContent = `x ${(e.clientX / window.innerWidth).toFixed(3)}  y ${(e.clientY / window.innerHeight).toFixed(3)}`;
    };
    window.addEventListener('pointermove', mv, { passive: true });
    return () => window.removeEventListener('pointermove', mv);
  }, []);

  return (
    <section id="top" ref={root} className="hero" aria-labelledby="hero-title">
      <HeroNet />
      <div className="hero__glow" aria-hidden="true"><i /></div>
      <div className="hero__term hero__fade" aria-hidden="true">
        <div className="hero__term-bar"><i /><i /><i /><span className="mono">~/subrata · zsh</span></div>
        <div className="hero__term-body mono">
          {TERM.map((l, i) => <p key={l} style={{ '--i': i }}>{l}</p>)}
          <p className="hero__term-cur">$ <span /></p>
        </div>
      </div>
      <div className="hero__inner">
        <p className="hero__eyebrow mono hero__fade">
          <i className="dot" /> Subrata Saha <span>/</span> {site.roles.join(' · ')}
        </p>
        <h1 id="hero-title" className="hero__title">
          <span className="sr-only">Subrata Saha: </span>
          <span className="hero__line">Building</span>
          <span className="hero__line hero__line--in">intelligent</span>
          <span className="hero__line hero__line--out">systems.</span>
        </h1>
        <div className="hero__row">
          <p className="hero__statement hero__fade">
            From trained models to the <em>Linux layer</em> beneath them, I work across the whole stack.
          </p>
          <ul className="hero__stats hero__fade" aria-label="At a glance">
            <li><b>{String(projects.length).padStart(2, '0')}</b><span className="mono">projects</span></li>
            <li><b>{String(LIVE).padStart(2, '0')}</b><span className="mono">live deploys</span></li>
            <li><b>06</b><span className="mono">layers</span></li>
          </ul>
          <svg className="hero__lens hero__fade" viewBox="0 0 100 100" aria-hidden="true">
            <circle cx="50" cy="50" r="46" fill="none" stroke="currentColor" strokeWidth=".6" strokeDasharray="1 3.2" />
            <circle cx="50" cy="50" r="34" fill="none" stroke="currentColor" strokeWidth=".8" />
            <path d="M12 50Q50 18 88 50Q50 82 12 50Z" fill="none" stroke="currentColor" strokeWidth="1.2" />
            <circle cx="50" cy="50" r="9" fill="none" stroke="var(--lime)" strokeWidth="1" />
            <circle cx="50" cy="50" r="3.4" fill="var(--lime)" />
          </svg>
        </div>
        <div className="hero__foot hero__fade">
          <p className="mono hero__hud">
            <span className="hero__count" data-n={pointCount || 0}>{pointCount ? `${pointCount.toLocaleString()} points · 1 photograph` : 'portrait · static render'}</span>
            <span ref={hud} className="hero__ptr">x 0.000  y 0.000</span>
          </p>
          <a href="#work" className="hero__cue mono" data-cursor="Scroll" onClick={(e) => { e.preventDefault(); scrollToTarget('#work'); }}>
            <span>Scroll</span><i />
          </a>
        </div>
      </div>
    </section>
  );
}
