// Single registration point for GSAP + plugins. Import gsap from here only.
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { MotionPathPlugin } from 'gsap/MotionPathPlugin';

gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
gsap.defaults({ ease: 'power3.out', duration: 0.9 });
ScrollTrigger.config({ ignoreMobileResize: true });

export { gsap, ScrollTrigger };
export const prefersReducedMotion = () =>
  typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
export const isCoarse = () =>
  typeof window !== 'undefined' && window.matchMedia('(hover: none), (pointer: coarse)').matches;
