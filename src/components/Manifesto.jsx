import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { useSection } from '../hooks/useSection';

/**
 * The statement is a wheat-pasted paper strip. Words rise into place on scroll, then three marker strokes
 * (yellow, cyan, pink) swipe behind the phrases that matter, the way someone highlights a printout.
 */
export default function Manifesto() {
  const root = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const p = scope.querySelector('.manifesto__text');
    const s = splitText(p, 'words');
    cleanups.push(s.revert);
    const marks = p.querySelectorAll('mark');
    gsap.set(s.words, { opacity: 0.1, yPercent: 70 });
    gsap.set(marks, { backgroundSize: '0% 78%' });
    gsap.set(scope.querySelector('.manifesto__paper'), { rotate: -3, yPercent: 14, opacity: 0.2 });
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: p, start: 'top 90%', end: 'bottom 48%', scrub: 0.6 } });
    tl.to(scope.querySelector('.manifesto__paper'), { rotate: -1.2, yPercent: 0, opacity: 1, duration: 0.5, ease: 'power3.out' }, 0)
      .to(s.words, { opacity: 1, yPercent: 0, stagger: 0.05, duration: 0.5, ease: 'power2.out' }, 0.05)
      .to(marks, { backgroundSize: '100% 78%', stagger: 0.28, duration: 0.45, ease: 'power2.inOut' }, 0.7);
  }, []);

  return (
    <section ref={root} className="manifesto" aria-label="Introduction">
      <div className="manifesto__paper">
        <span className="tape manifesto__tape" aria-hidden="true" />
        <p className="label mono" data-reveal>( Approach )</p>
        <p className="manifesto__text">
          I like knowing why a system behaves the way it does. So I <mark className="mk1">train the models</mark>, <mark className="mk2">write the services</mark> around them, and <mark className="mk3">read down into Linux</mark> when the abstractions leak.
        </p>
      </div>
    </section>
  );
}
