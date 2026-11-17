import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { useSection } from '../hooks/useSection';

/**
 * Zoom-through seam between sections: the next section's name rushes toward the camera
 * as a giant outline, passes through, and the rule lines draw. Keeps the story continuous.
 */
const PATH = { down: [0, -60, 0, 60], diagdown: [-70, -40, 70, 40], diagup: [70, 40, -70, -40] };

export default function Seam({ n, label, dir = 'down' }) {
  const root = useRef(null);
  useSection(root, ({ scope }) => {
    if (prefersReducedMotion()) return;
    const word = scope.querySelector('.seam__word');
    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: 0.7 },
    });
    const [x0, y0, x1, y1] = PATH[dir];
    tl.fromTo(word, { scale: 0.18, opacity: 0, xPercent: x0, yPercent: y0 }, { scale: 1, opacity: 1, xPercent: 0, yPercent: 0, duration: 0.45, ease: 'power2.out' }, 0)
      .to(word, { scale: 4.2, opacity: 0, xPercent: x1, yPercent: y1, duration: 0.55, ease: 'power2.in' }, 0.45)
      .fromTo('.seam__rule', { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.05 }, 0)
      .to('.seam__rule', { scaleX: 0, transformOrigin: '100% 50%', duration: 0.4 }, 0.6)
      .fromTo('.seam__n', { yPercent: 120 }, { yPercent: 0, duration: 0.3 }, 0.1);
  }, []);
  return (
    <div ref={root} className="seam" aria-hidden="true">
      <i className="seam__rule" />
      <p className="seam__n mono">{n} — next</p>
      <span className="seam__word">{label}</span>
      <i className="seam__rule seam__rule--b" />
    </div>
  );
}
