import Lenis from 'lenis';
import { gsap, ScrollTrigger, prefersReducedMotion } from './gsap';
import { motion } from './state';

let lenis = null;

export function startSmoothScroll() {
  if (lenis) return lenis;
  if (prefersReducedMotion()) {
    ScrollTrigger.defaults({ scroller: window });
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
  if (!lenis) return;
  gsap.ticker.remove(lenis._tick);
  lenis.destroy();
  lenis = null;
}

export const pauseScroll = () => lenis && lenis.stop();
export const resumeScroll = () => lenis && lenis.start();

export function scrollToTarget(target, opts = {}) {
  if (lenis) lenis.scrollTo(target, { duration: 1.6, easing: (t) => 1 - Math.pow(1 - t, 4), ...opts });
  else {
    const el = typeof target === 'string' ? document.querySelector(target) : target;
    if (el && el.scrollIntoView) el.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
    else if (typeof target === 'number') window.scrollTo({ top: target });
  }
}
