import { useLayoutEffect } from 'react';
import { gsap } from '../animation/gsap';
import { motion } from '../animation/state';

/**
 * Cross-section scene choreography: the neural field settles back into the
 * portrait as the contact section arrives. Mounted after all sections so its
 * triggers measure after pin spacers exist.
 */
export default function Choreography() {
  useLayoutEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: { trigger: '#contact', start: 'top 60%', end: 'top -10%', scrub: 0.8 },
        defaults: { ease: 'none' },
      });
      tl.fromTo(motion, { disperse: 1, contact: 0 }, { disperse: 0, contact: 1, immediateRender: false }, 0)
        .fromTo('.gl-canvas, .gl-fallback', { opacity: 0.55 }, { opacity: 1, immediateRender: false }, 0);
    });
    return () => ctx.revert();
  }, []);
  return null;
}
