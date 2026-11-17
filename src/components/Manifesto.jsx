import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { motion } from '../animation/state';
import { useSection } from '../hooks/useSection';

const TEXT = 'I like knowing why a system behaves the way it does. So I train the models, write the services around them, and read down into Linux when the abstractions leak.';
const MARQUEE = ['Machine Learning', 'Agents & RAG', 'Computer Vision', 'Systems', 'Security', 'Open Source'];

export default function Manifesto() {
  const root = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    const reduced = prefersReducedMotion();
    const p = scope.querySelector('.manifesto__text');
    const s = splitText(p, 'words');
    cleanups.push(s.revert);
    if (!reduced) {
      gsap.set(s.words, { opacity: 0.12, yPercent: 70 });
      gsap.to(s.words, {
        opacity: 1,
        yPercent: 0,
        stagger: 0.1,
        ease: 'power2.out',
        scrollTrigger: { trigger: p, start: 'top 88%', end: 'bottom 55%', scrub: 0.5 },
      });

    }
  }, []);

  return (
    <section ref={root} className="manifesto" aria-label="Introduction">
      <div className="wrap">
        <p className="label mono" data-reveal>( Approach )</p>
        <p className="manifesto__text">{TEXT}</p>
      </div>
    </section>
  );
}
