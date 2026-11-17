import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion, isCoarse } from '../animation/gsap';
import { scrollToTarget, pauseScroll, resumeScroll } from '../animation/smoothScroll';
import { motion } from '../animation/state';
import { sections, site } from '../data/content';
import Magnetic from './Magnetic';

// Each char is rendered twice (stacked); hovering rolls the pair upward.
function RollText({ text }) {
  return (
    <span className="roll" aria-hidden="true">
      {[...text].map((c, i) => (
        <span className="roll__c" key={i} style={{ '--i': i }}>
          <span>{c}</span>
          <span>{c}</span>
        </span>
      ))}
    </span>
  );
}

export default function Nav({ visible }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const [current, setCurrent] = useState(0);
  const menu = useRef(null);
  const btn = useRef(null);
  const tl = useRef(null);
  const previewRef = useRef(null);
  const wipe = useRef(null);
  const wiping = useRef(false);

  // which section is on screen
  useEffect(() => {
    const triggers = sections.map((s, i) =>
      ScrollTrigger.create({
        trigger: `#${s.id}`,
        start: 'top 55%',
        end: 'bottom 55%',
        onToggle: (self) => self.isActive && setCurrent(i),
      })
    );
    return () => triggers.forEach((t) => t.kill());
  }, []);

  // menu timeline: circle wipe from the button, links rise, preview slides
  useEffect(() => {
    const el = menu.current;
    const reduced = prefersReducedMotion();
    const ctx = gsap.context(() => {
      const links = el.querySelectorAll('.menu__link .roll__c, .menu__idx');
      tl.current = gsap
        .timeline({ paused: true, defaults: { ease: 'expo.out' } })
        .set(el, { visibility: 'visible' })
        .fromTo(el, { clipPath: 'circle(0px at calc(100% - 56px) 44px)' }, { clipPath: 'circle(150vmax at calc(100% - 56px) 44px)', duration: reduced ? 0.01 : 1.1, ease: 'expo.inOut' })
        .fromTo('.menu__item', { yPercent: 70, opacity: 0 }, { yPercent: 0, opacity: 1, duration: reduced ? 0.01 : 0.9, stagger: 0.05 }, '-=0.6')
        .fromTo('.menu__side > *', { y: 30, opacity: 0 }, { y: 0, opacity: 1, duration: reduced ? 0.01 : 0.8, stagger: 0.06 }, '-=0.7')
        .eventCallback('onReverseComplete', () => gsap.set(el, { visibility: 'hidden' }));
    }, menu);
    return () => ctx.revert();
  }, []);

  const toggle = (next) => {
    setOpen(next);
    motion.menuOpen = next;
    if (next) {
      pauseScroll();
      tl.current.timeScale(1).play();
      setTimeout(() => menu.current?.querySelector('.menu__link')?.focus(), 450);
    } else {
      tl.current.timeScale(1.6).reverse();
      resumeScroll();
      btn.current?.focus();
    }
    document.querySelector('main')?.toggleAttribute('inert', next);
  };

  useEffect(() => {
    if (!open) return;
    const key = (e) => {
      if (e.key === 'Escape') toggle(false);
      if (e.key === 'Tab') {
        const f = [...menu.current.querySelectorAll('a,button')].concat(btn.current);
        const first = f[0], last = f[f.length - 1];
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      }
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
    // eslint-disable-next-line
  }, [open]);

  // preview swatch reacts to the pointer (desktop)
  useEffect(() => {
    if (!open || isCoarse()) return;
    const el = previewRef.current;
    const xt = gsap.quickTo(el, '--mx', { duration: 0.8 });
    const yt = gsap.quickTo(el, '--my', { duration: 0.8 });
    const mv = (e) => { xt((e.clientX / window.innerWidth) * 100); yt((e.clientY / window.innerHeight) * 100); };
    window.addEventListener('pointermove', mv);
    return () => window.removeEventListener('pointermove', mv);
  }, [open]);

  // cinematic navigation: two curtains sweep up, the destination is named, the page jumps unseen, curtains lift
  const go = (e, id) => {
    e.preventDefault();
    if (wiping.current) return;
    const target = id === 'top' ? 0 : `#${id}`;
    const jump = () => {
      setOpen(false);
      motion.menuOpen = false;
      gsap.set(menu.current, { visibility: 'hidden' });
      tl.current.progress(0).pause();
      document.querySelector('main')?.removeAttribute('inert');
      resumeScroll();
      scrollToTarget(target, { immediate: true, force: true });
      ScrollTrigger.update();
    };
    if (prefersReducedMotion()) { jump(); return; }
    wiping.current = true;
    const w = wipe.current;
    const layers = w.querySelectorAll('i');
    const word = w.querySelector('b span');
    word.textContent = sections.find((x) => x.id === id).label;
    gsap
      .timeline({ onComplete: () => { wiping.current = false; btn.current?.focus(); } })
      .set(w, { visibility: 'visible' })
      .fromTo(layers, { clipPath: 'inset(100% 0 0 0)' }, { clipPath: 'inset(0% 0 0 0)', duration: 0.8, stagger: 0.1, ease: 'expo.inOut' })
      .fromTo(word, { yPercent: 115 }, { yPercent: 0, duration: 0.7, ease: 'expo.out' }, '-=0.5')
      .call(jump)
      .to(word, { yPercent: -115, duration: 0.5, ease: 'expo.in' }, '+=0.2')
      .to(layers, { clipPath: 'inset(0 0 100% 0)', duration: 0.85, stagger: 0.1, ease: 'expo.inOut' }, '-=0.3')
      .set(w, { visibility: 'hidden' });
  };

  const s = sections[active];
  return (
    <>
      <header className={`nav ${visible ? 'is-in' : ''}`}>
        <a href="#top" className="nav__logo" onClick={(e) => go(e, 'top')} aria-label="Subrata Saha, back to top">
          <span className="nav__mark" aria-hidden="true">SS</span>
          <span className="nav__role mono">{site.roles[0]}</span>
        </a>
        <div className="nav__where mono" aria-hidden="true">
          <span>{sections[current].n}</span> / 06 <b>{sections[current].label}</b>
        </div>
        <Magnetic
          as="button"
          innerRef={btn}
          className={`nav__menu ${open ? 'is-open' : ''}`}
          onClick={() => toggle(!open)}
          aria-expanded={open}
          aria-controls="menu"
         
          strength={0.25}
        >
          <span className="nav__menu-label mono">{open ? 'Close' : 'Menu'}</span>
          <span className="nav__burger" aria-hidden="true"><i /><i /></span>
        </Magnetic>
      </header>

      <div ref={wipe} className="wipe" aria-hidden="true" style={{ visibility: 'hidden' }}><i /><i /><b><span /></b></div>

      <div id="menu" ref={menu} className="menu" role="dialog" aria-modal="true" aria-label="Site navigation" style={{ visibility: 'hidden' }}>
        <nav className="menu__nav" aria-label="Sections" style={{ '--h': active }}>
          <ul>
            {sections.map((sec, i) => (
              <li className="menu__item" key={sec.id} style={{ '--i': i }}>
                <a
                  href={`#${sec.id}`}
                  className={`menu__link ${active === i ? 'is-active' : ''}`}
                  onClick={(e) => go(e, sec.id)}
                  onPointerEnter={() => setActive(i)}
                  onFocus={() => setActive(i)}
                >
                  <span className="menu__idx mono">{sec.n}</span>
                  <RollText text={sec.label} />
                  <span className="sr-only">{sec.label}</span>
                </a>
              </li>
            ))}
          </ul>
        </nav>
        <aside className="menu__side" aria-hidden="true">
          <div ref={previewRef} className={`menu__preview p${active}`}>
            <span className="menu__bignum">{s.n}</span>
          </div>
          <p className="menu__blurb">{s.blurb}</p>
          <p className="mono menu__meta">GitHub / SubrataSaha8191 · {site.school}</p>
        </aside>
      </div>
    </>
  );
}
