import { useCallback, useEffect, useState } from 'react';
import { ScrollTrigger } from './animation/gsap';
import { startSmoothScroll, stopSmoothScroll, pauseScroll, resumeScroll } from './animation/smoothScroll';
import HeroCanvas from './gl/HeroCanvas';
import Preloader from './components/Preloader';
import Cursor from './components/Cursor';
import Nav from './components/Nav';
import Hero from './components/Hero';
import Manifesto from './components/Manifesto';
import Work from './components/Work';
import Lab from './components/Lab';
import About from './components/About';
import Arsenal from './components/Arsenal';
import Path from './components/Path';
import Contact from './components/Contact';
import CaseStudy from './components/CaseStudy';
import Choreography from './components/Choreography';
import Giant from './components/Giant';
import ScrollDial from './components/ScrollDial';

export default function App() {
  const [glInfo, setGlInfo] = useState(null);
  const [ready, setReady] = useState(false);
  const [done, setDone] = useState(false);
  const [project, setProject] = useState(null);

  useEffect(() => {
    history.scrollRestoration = 'manual';
    window.scrollTo(0, 0);
    startSmoothScroll();
    pauseScroll(); // locked until the opening sequence ends
    document.documentElement.classList.add('is-loading');
    document.querySelector('main')?.setAttribute('inert', '');
    return stopSmoothScroll;
  }, []);

  // reveal: hero typography + portrait scan begin while the hole is still opening
  const onReveal = useCallback(() => setReady(true), []);
  const onDone = useCallback(() => {
    document.documentElement.classList.remove('is-loading');
    document.querySelector('main')?.removeAttribute('inert');
    setDone(true);
    resumeScroll();
    requestAnimationFrame(() => ScrollTrigger.refresh());
  }, []);

  // Layout can shift after first measure (web fonts, lazy images). Pins and scrubs depend on exact
  // positions, so re-measure whenever the document height actually changes.
  useEffect(() => {
    let t;
    const refresh = () => { clearTimeout(t); t = setTimeout(() => ScrollTrigger.refresh(), 220); };
    document.fonts?.ready.then(refresh);
    document.fonts?.addEventListener?.('loadingdone', refresh);
    window.addEventListener('load', refresh);
    const ro = new ResizeObserver(refresh);
    ro.observe(document.body);
    return () => {
      clearTimeout(t);
      ro.disconnect();
      document.fonts?.removeEventListener?.('loadingdone', refresh);
      window.removeEventListener('load', refresh);
    };
  }, []);

  const open = useCallback((id) => setProject(id), []);
  const close = useCallback(() => setProject(null), []);

  return (
    <>
      <a href="#work" className="skip">Skip to work</a>
      <svg width="0" height="0" style={{ position: 'absolute' }} aria-hidden="true" focusable="false">
        <defs>
          {[['ink', '#ece8dc', 2, 1], ['lime', '#c6ff3d', 1.6, 1], ['faint', '#ece8dc', 1, 0.12]].map(([n, c, r, o]) => (
            <filter key={n} id={`ol-${n}`} x="-3%" y="-8%" width="106%" height="116%" colorInterpolationFilters="sRGB">
              <feMorphology in="SourceAlpha" operator="erode" radius={r} result="e" />
              <feComposite in="SourceAlpha" in2="e" operator="out" result="ring" />
              <feFlood floodColor={c} floodOpacity={o} />
              <feComposite in2="ring" operator="in" />
            </filter>
          ))}
        </defs>
      </svg>
      <Cursor />
      <HeroCanvas onReady={setGlInfo} introGate={ready} />
      <div className="grain" aria-hidden="true" />
      {!done && <Preloader glInfo={glInfo} onReveal={onReveal} onDone={onDone} />}
      <Nav visible={ready} />
      <ScrollDial visible={ready} />
      <main id="main">
        <Hero introGate={ready} pointCount={glInfo?.count} />
        <Manifesto />
        <Giant />
        <Work onOpen={open} />
        <Lab onOpen={open} />
        <About />
        <Arsenal />
        <Path />
        <Contact pointCount={glInfo?.count} />
        <Choreography />
      </main>
      <CaseStudy id={project} onClose={close} onNavigate={setProject} />
    </>
  );
}
