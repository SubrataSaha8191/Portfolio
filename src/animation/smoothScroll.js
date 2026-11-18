import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion, isCoarse } from './gsap';
import { motion } from './state';

let lenis = null;
let norm = null; // touch devices: ScrollTrigger.normalizeScroll observer

export function startSmoothScroll() {
  if (lenis) return lenis;
  if (norm) return null;
  if (prefersReducedMotion()) {
    ScrollTrigger.defaults({ scroller: window });
    return null;
  }
  if (isCoarse()) {
    // On phones the browser scrolls on its own compositor thread, so position:fixed pins visibly slide before snapping
    // (the Path section showed vertical AND horizontal movement). normalizeScroll takes over touch scrolling so every pin
    // holds perfectly still; Lenis (a mouse-wheel smoother) isn't needed there.
    norm = ScrollTrigger.normalizeScroll({ allowNestedScroll: true, type: 'touch,wheel,pointer' });
    return null;
  }
  lenis = new Lenis({ duration: 1.15, easing: (t) => 1 - Math.pow(1 - t, 3.2), smoothWheel: true });
  lenis.on('scroll', (e) => {
    ScrollTrigger.update();
    motion.scroll = e.scroll;
    motion.velocity = e.velocity;
  });
  const tick = (time) => lenis && lenis.raf(time * 1000);
  gsap.ticker.add(tick);
  gsap.ticker.lagSmoothing(0);
  lenis._tick = tick;
  return lenis;
}

export function stopSmoothScroll() {
  if (norm) { norm.kill(); norm = null; }
  if (!lenis) return;
  gsap.ticker.remove(lenis._tick);
  lenis.destroy();
  lenis = null;
}

export const pauseScroll = () => { if (lenis) lenis.stop(); if (norm) norm.disable(); };
export const resumeScroll = () => { if (lenis) lenis.start(); if (norm) norm.enable(); };

export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    const behavior = prefersReducedMotion() || opts.immediate ? 'auto' : 'smooth';
    if (typeof target === 'number') window.scrollTo({ top: target, behavior });
    else if (el && el.scrollIntoView) el.scrollIntoView({ behavior });
  }
}
