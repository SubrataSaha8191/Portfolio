import { useEffect, useRef, useState } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion, isCoarse } from '../animation/gsap';
import { scrollToTarget, pauseScroll, resumeScroll } from '../animation/smoothScroll';
import { motion } from '../animation/state';
import { sections, site } from '../data/content';
import Magnetic from './Magnetic';
import { runWipe } from '../animation/paintWipe';

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

// One hand-drawn doodle per menu link. Each draws itself (stroke-dash) on hover/focus, with a paper
// "sticker" copy offset behind the black ink line, like a marker tag over a spray stencil.
const DOODLES = [
  { c: 'u', vb: '0 0 100 24', par: 'none', d: 'M2 14 C10 3 16 23 26 12 S42 3 52 14 S70 23 80 10 S94 7 98 14', w: 5 },
  { c: 'r', vb: '0 0 60 60', d: 'M4 34 C16 29 30 39 47 30 M34 11 L50 30 L31 49', w: 6 },
  { c: 'o', vb: '0 0 100 50', d: 'M12 30 C4 8 62 -3 93 14 C110 27 70 49 30 45 C-2 41 -1 13 42 6 C72 2 96 12 91 25', w: 4 },
  { c: 's', vb: '0 0 60 60', d: 'M30 4 V19 M30 41 V56 M4 30 H19 M41 30 H56 M12 12 L22 22 M38 38 L48 48 M48 12 L38 22 M22 38 L12 48', w: 5 },
  { c: 'b', vb: '0 0 50 70', d: 'M30 3 L9 38 H25 L15 67 L44 26 H28 Z', w: 5 },
  { c: 'd', vb: '0 0 100 24', par: 'none', d: 'M2 12 H90 M78 3 L98 12 L78 21', w: 5 },
  { c: 'k', vb: '0 0 80 50', d: 'M6 44 L10 12 L28 30 L40 5 L52 30 L70 12 L74 44 Z', w: 5 },
];
function Doodle({ i }) {
  const o = DOODLES[i % DOODLES.length];
  return (
    <svg className={`menu__doodle d--${o.c}`} viewBox={o.vb} preserveAspectRatio={o.par || 'xMidYMid meet'} aria-hidden="true" focusable="false">
      <path d={o.d} transform="translate(2.2 2.2)" fill="none" stroke="#efe8d6" strokeWidth={o.w} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray={o.dash ? '0.06 0.05' : undefined} />
      <path d={o.d} fill="none" stroke="#0d0c0b" strokeWidth={o.w} strokeLinecap="round" strokeLinejoin="round" pathLength="1" strokeDasharray={o.dash ? '0.06 0.05' : undefined} />
    </svg>
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

  // navigation = the liquid paint wipe (WebGL). The page jumps while the screen is fully covered.
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
    runWipe(sections.find((x) => x.id === id).label, jump).then(() => { wiping.current = false; btn.current?.focus(); });
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
                  <span className="menu__word"><RollText text={sec.label} /><Doodle i={i} /></span>
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
