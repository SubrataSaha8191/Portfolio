import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { scrollToTarget } from '../animation/smoothScroll';
import { useSection } from '../hooks/useSection';
import { initReveals, revealSunrise } from '../animation/reveals';
import { site } from '../data/content';
import Magnetic from './Magnetic';

export default function Contact({ pointCount }) {
  const root = useRef(null);
  useSection(root, ({ cleanups, scope }) => {
    initReveals(scope, cleanups);
    revealSunrise(scope);
    if (prefersReducedMotion()) return;
    gsap.from('.contact__links > *', { y: 40, opacity: 0, stagger: 0.1, scrollTrigger: { trigger: '.contact__links', start: 'top 92%' } });
  }, []);

  const links = [
    { label: 'GitHub', href: site.github },
    site.email && { label: site.email, href: `mailto:${site.email}` },
    site.linkedin && { label: 'LinkedIn', href: site.linkedin },
  ].filter(Boolean);

  return (
    <section id="contact" ref={root} className="contact" aria-labelledby="contact-title">
      <i className="contact__flood" aria-hidden="true" />
      <span className="bgword" data-dir="r" aria-hidden="true">Hello</span>
      <div className="wrap contact__grid">
        <div className="contact__copy">
          <p className="label mono" data-reveal>( 06 — Contact )</p>
          <h2 id="contact-title" className="contact__title">
            <span data-split data-fx="fall">Let's build</span>
            <span data-split data-fx="fall">something</span>
            <span data-split data-fx="fall" className="out">that thinks.</span>
          </h2>
          <p className="contact__sub" data-reveal>Open to internships, research collaborations and interesting problems in ML, agents and systems.</p>
          <div className="contact__links">
            {links.map((l, i) => (
              <Magnetic as="a" key={l.href} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer" className={`btn ${i === 0 ? 'btn--lime' : ''}`} strength={0.3}>
                {l.label} <span aria-hidden="true">↗</span>
              </Magnetic>
            ))}
          </div>
        </div>
      </div>
      <footer className="foot mono">
        <span>© {new Date().getFullYear()} Subrata Saha</span>
        <span>React · GSAP · Three.js{pointCount ? ` · ${pointCount.toLocaleString()} points sampled from one photograph` : ''}</span>
        <button onClick={() => scrollToTarget(0)} data-cursor="Top">Back to top ↑</button>
      </footer>
    </section>
  );
}
