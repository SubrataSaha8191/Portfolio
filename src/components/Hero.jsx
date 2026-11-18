import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { tunnel } from '../animation/state';
import { scrollToTarget } from '../animation/smoothScroll';
import { useSection } from '../hooks/useSection';
import PortraitSpray from './PortraitSpray';

/**
 * The hero is what is on the other side of the wall. At scroll 0 you see only a hot, bright backdrop through the
 * ragged hole the bazooka made. Scrolling travels you through it: the hole grows (tunnel.render), the backdrop cools
 * back to concrete and the title card fades from 0 to full opacity while it settles toward the camera. Once the
 * title is fully there the sprayer paints the portrait. After that the title ruptures outward as you keep scrolling.
 */
export default function Hero({ onPortraitReady }) {
  const root = useRef(null);
  const portrait = useRef(null);

  useSection(root, ({ scope }) => {
    const reduced = prefersReducedMotion();
    const lines = [...scope.querySelectorAll('.gh__line')];
    const T = reduced ? 0 : 1.1; // length of the fly-through phase in timeline units
    const X = reduced ? 0 : 0.7; // extra hold after the fly-through so the portrait finishes painting before the title leaves
    const fx = { immediateRender: false };

    if (!reduced) {
      gsap.set('.gh__title', { opacity: 0, scale: 1.35, transformOrigin: '50% 42%' });
      gsap.set('.gh__note, .gh__stamp, .gh__cue', { opacity: 0 });
    } else {
      portrait.current?.play();
    }

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scope, start: 'top top', end: reduced ? '+=110%' : '+=290%', pin: true, scrub: 0.7, anticipatePin: 1 },
    });

    if (!reduced) {
      tl.fromTo(tunnel, { p: 0 }, { p: 1, duration: T, ease: 'none', ...fx, onUpdate: () => tunnel.render && tunnel.render(tunnel.p) }, 0)
        .fromTo('.gh__title', { opacity: 0, scale: 1.35 }, { opacity: 1, scale: 1, duration: T * 0.78, ease: 'power2.out', ...fx }, T * 0.18)
        .fromTo('.gh__note, .gh__stamp, .gh__cue', { opacity: 0 }, { opacity: 1, duration: T * 0.35, ...fx }, T * 0.65)
        .fromTo('.gh__backdrop', { opacity: 1 }, { opacity: 0, duration: T * 0.95, ...fx }, 0)
        .call(() => portrait.current && portrait.current.play(), null, T * 0.4);
    }

    // after the fly-through: the title ruptures, the portrait lifts away
    tl.call(() => portrait.current && portrait.current.finish(), null, T + X)
      .fromTo(lines[0], { xPercent: 0, rotate: 0 }, { xPercent: -34, rotate: -7, duration: 1, ...fx }, T + X)
      .fromTo(lines[1], { xPercent: 0, rotate: 0 }, { xPercent: 30, rotate: 6, duration: 1, ...fx }, T + X)
      .fromTo(lines[2], { yPercent: 0 }, { yPercent: 160, duration: 1, ...fx }, T + X)
      .fromTo('.gh__portrait', { yPercent: 0, scale: 1 }, { yPercent: -16, scale: 1.14, duration: 1, ...fx }, T + X)
      .fromTo('.gh__note, .gh__stamp, .gh__cue', { filter: 'opacity(1)' }, { filter: 'opacity(0)', duration: 0.4, ...fx }, T + X)
      .to({}, { duration: 0.2 });
  }, []);

  return (
    <section id="top" ref={root} className="gh" aria-labelledby="hero-title">
      <div className="gh__backdrop" aria-hidden="true" />
      <div className="gh__portrait">
        <PortraitSpray ref={portrait} onReady={onPortraitReady} />
      </div>
      <p className="gh__note mono">Subrata Saha <span>/</span> Computer Science Engineer <span>/</span> AI·ML <span>/</span> Systems <span>/</span> Research</p>
      <h1 id="hero-title" className="gh__title">
        <span className="sr-only">Subrata Saha: </span>
        <span className="gh__line gh__line--1">Engineer.</span>
        <span className="gh__line gh__line--2">Experimenter.</span>
        <span className="gh__line gh__line--3">Builder of intelligent things.</span>
      </h1>
      <p className="gh__stamp mono" aria-hidden="true">B.Tech CSE · RCCIIT · year 3</p>
      <a href="#work" className="gh__cue mono" data-cursor="Scroll" onClick={(e) => { e.preventDefault(); scrollToTarget('#work'); }}>
        <span>Seven chapters</span>
        <svg viewBox="0 0 60 60" aria-hidden="true"><path d="M30 6 C26 22 34 34 30 52 M16 40 L30 54 L44 40" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </a>
    </section>
  );
}
