import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './animation/gsap';
import { startSmoothScroll, stopSmoothScroll, pauseScroll, resumeScroll, scrollToTarget } from './animation/smoothScroll';
import Preloader from './components/Preloader';
import SprayCursor from './components/SprayCursor';
import ScrollRail from './components/ScrollRail';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Giant from './components/Giant';
import Chapters from './components/Chapters';
import Lab from './components/Lab';
import About from './components/About';
import Arsenal from './components/Arsenal';
import Path from './components/Path';
import Contact from './components/Contact';
import { loadThree } from './animation/paintWipe';

export default function App() {
  const [portraitReady, setPortraitReady] = useState(false);
  const [fontsReady, setFontsReady] = useState(false);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startSmoothScroll();
    pauseScroll(); // locked until the opening film ends
    document.documentElement.classList.add('is-loading');
    document.querySelector('main')?.setAttribute('inert', '');
    return stopSmoothScroll;
  }, []);

  // readiness = fonts + the portrait stencil built. Never a fake percentage.
  useEffect(() => {
    document.fonts?.ready.then(() => setFontsReady(true));
    const t = setTimeout(() => setFontsReady(true), 2500);
    return () => clearTimeout(t);
  }, []);

  // The hole is open: unlock scroll (the fly-through is scroll-driven) and bring in the nav and the rail.
  const onReveal = useCallback(() => {
    setRevealed(true);
    document.documentElement.classList.remove('is-loading');
    document.querySelector('main')?.removeAttribute('inert');
    resumeScroll();
    // (the fonts/layout refresh already ran while the film played; only a gentle position update is needed here)
    requestAnimationFrame(() => ScrollTrigger.update());
    if (window.requestIdleCallback) window.requestIdleCallback(() => loadThree(), { timeout: 3000 });
    else setTimeout(loadThree, 1500);
  }, []);

  // Layout can shift after first measure (fonts, lazy images). Pins depend on exact positions.
  useEffect(() => {
    let t;
    // A refresh re-measures every pin (hundreds of ms), so it must never run while the user is scrolling and
    // is skipped when the page height didn't really change.
    let lastH = 0, lastScroll = 0;
    const onScr = () => { lastScroll = performance.now(); };
    window.addEventListener('scroll', onScr, { passive: true });
    const run = () => {
      if (performance.now() - lastScroll < 500) { t = setTimeout(run, 400); return; }
      const h = document.documentElement.scrollHeight;
      if (lastH && Math.abs(h - lastH) < 3) return;
      lastH = h;
      ScrollTrigger.refresh();
    };
    const refresh = () => { clearTimeout(t); t = setTimeout(run, 260); };
    document.fonts?.ready.then(refresh);
    document.fonts?.addEventListener?.('loadingdone', refresh);
    window.addEventListener('load', refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    return () => { clearTimeout(t); window.removeEventListener('scroll', onScr); ro.disconnect(); document.fonts?.removeEventListener?.('loadingdone', refresh); window.removeEventListener('load', refresh); };
  }, []);

  const open = useCallback((id) => scrollToTarget(`#ch-${id}`), []);

  return (
    <>
      <a href="#work" className="skip">Skip to the seven chapters</a>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          {[['ink', '#efe8d6', 2, 1], ['lime', '#ffd60a', 1.6, 1], ['faint', '#efe8d6', 1, 0.14]].map(([n, c, r, o]) => (
            <filter key={n} id={`ol-${n}`} x="-3%" y="-8%" width="106%" height="116%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius={r} result="e" />
              <feComposite in="SourceAlpha" in2="e" operator="out" result="ring" />
              <feFlood floodColor={c} floodOpacity={o} />
              <feComposite in2="ring" operator="in" />
            </filter>
          ))}
        </defs>
      </svg>
      <SprayCursor />
      <div className="grain" aria-hidden="true" />
      <Preloader ready={portraitReady && fontsReady} onReveal={onReveal} />
      <Nav visible={revealed} />
      <ScrollRail visible={revealed} />
      <main id="main">
        <Hero onPortraitReady={() => setPortraitReady(true)} />
        <Manifesto />
        <Giant />
        <Chapters />
        <Lab onOpen={open} />
        <About />
        <Arsenal />
        <Path />
        <Contact />
      </main>
    </>
  );
}
