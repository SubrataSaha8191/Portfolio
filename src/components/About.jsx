import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { useSection } from '../hooks/useSection';
import { site } from '../data/content';

// Chapters double as annotations: each one is tied to a point on the portrait, the way a
// vision model labels a subject. Coordinates are in the photo's own 768x900 space.
const CHAPTERS = [
  { n: '01', t: 'Understand', pt: [470, 150], tag: [600, 66], body: `I'm a third-year B.Tech student in Computer Science and Engineering at ${site.school}. I want to know how things work: how a model is trained and judged, how it ends up behind a service, and what the operating system is doing underneath.` },
  { n: '02', t: 'Research', pt: [432, 210], tag: [622, 250], body: 'I am drawn to the research-shaped questions: what actually holds up, and where it breaks. Most of what I publish has its limits written down, including what it does not do.' },
  { n: '03', t: 'Build', pt: [300, 748], tag: [470, 838], body: "I work across the stack because the interesting problems sit at the seams. A classifier only matters once it has an API; an agent is only trustworthy once you know what it is allowed to run." },
];
const FACTS = [
  ['Studying', 'B.Tech CSE · third year'],
  ['Working on', 'ML · NLP & vision · RAG · agents'],
  ['Underneath', 'Linux · systems · security basics'],
  ['Writes in', 'Python · TS · Rust · C/C++ · Java'],
];
const LANDMARKS = [[335, 214], [424, 208], [380, 268], [345, 296], [416, 294]];
const BOX = 'M262 110v-26h26M500 110v-26h-26M262 392v26h26M500 392v26h-26';

export default function About() {
  const root = useRef(null);

  useSection(root, ({ cleanups, scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const h = scope.querySelector('.about__h');
    const sp = splitText(h, 'words');
    cleanups.push(sp.revert);
    const chaps = scope.querySelectorAll('.chap');
    const tags = scope.querySelectorAll('.about__tag');
    const links = scope.querySelectorAll('.about__link');
    const dots = scope.querySelectorAll('.about__ptdot');
    const marks = scope.querySelectorAll('.about__rail li');

    gsap.set(sp.words, { opacity: 0.14 });
    gsap.set(chaps, { opacity: 0, yPercent: 14 });
    gsap.set([tags, links, dots], { opacity: 0 });
    gsap.set('.facts li', { opacity: 0, y: 18 });
    gsap.set('.about__disc', { scale: 0.15, transformOrigin: '50% 50%' });
    gsap.set('.about__photo', { filter: 'grayscale(1) contrast(1.15) brightness(0.8)', yPercent: 8 });
    gsap.set('.about__box', { scale: 2.6, opacity: 0, svgOrigin: '381 251' });
    gsap.set('.about__lm', { scale: 0, opacity: 0, transformOrigin: '50% 50%' });
    gsap.set('.about__mesh', { opacity: 0 });
    links.forEach((l) => { const len = l.getTotalLength(); gsap.set(l, { strokeDasharray: len, strokeDashoffset: len }); });

    const tl = gsap.timeline({
      defaults: { ease: 'none' },
      scrollTrigger: { trigger: scope.querySelector('.about__stage'), start: 'top top', end: '+=400%', pin: true, scrub: 0.7, anticipatePin: 1 },
    });
    // the lime disc rises behind the subject, the photo comes alive from monochrome
    tl.to('.about__disc', { scale: 1, duration: 1.3, ease: 'power3.out' }, 0)
      .to('.about__photo', { yPercent: 0, duration: 1.3, ease: 'power3.out' }, 0)
      .to('.about__photo', { filter: 'grayscale(0) contrast(1.02) brightness(1)', duration: 1.4 }, 1.0)
      .to(sp.words, { opacity: 1, stagger: 0.12, duration: 0.5 }, 0.1)
      // detection box closes in on the face, landmarks and mesh light up
      .to('.about__box', { scale: 1, opacity: 1, duration: 0.9, ease: 'power3.inOut' }, 0.8)
      .to('.about__lm', { scale: 1, opacity: 1, stagger: 0.1, duration: 0.3, ease: 'back.out(3)' }, 1.5)
      .to('.about__mesh', { opacity: 0.7, duration: 0.5 }, 1.8)
      .fromTo('.about__scan', { top: '0%' }, { top: '100%', duration: 3.4 }, 0.3);

    CHAPTERS.forEach((_, i) => {
      const at = 1.0 + i * 0.9;
      tl.to(chaps[i], { opacity: 1, yPercent: 0, duration: 0.35, ease: 'power2.out' }, at)
        .to(tags[i], { opacity: 1, duration: 0.3 }, at)
        .to(links[i], { opacity: 1, strokeDashoffset: 0, duration: 0.5, ease: 'power2.out' }, at)
        .to(dots[i], { opacity: 1, duration: 0.2 }, at)
        .to(marks[i], { '--on': 1, duration: 0.2 }, at);
      if (i < CHAPTERS.length - 1) {
        tl.to(chaps[i], { opacity: 0, yPercent: -14, duration: 0.3, ease: 'power2.in' }, at + 0.65)
          .to(tags[i], { opacity: 0.18, duration: 0.3 }, at + 0.65)
          .to(links[i], { opacity: 0.2, duration: 0.3 }, at + 0.65)
          .to(dots[i], { opacity: 0.2, duration: 0.3 }, at + 0.65)
          .to(marks[i], { '--on': 0.35, duration: 0.2 }, at + 0.65);
      }
    });
    tl.to('.facts li', { opacity: 1, y: 0, stagger: 0.12, duration: 0.3, ease: 'power2.out' }, 3.3)
      .to({}, { duration: 0.3 });

    gsap.fromTo(scope.querySelector('.about__grid'), { rotate: -8, yPercent: 16, opacity: 0, transformOrigin: '0% 100%' }, { rotate: 0, yPercent: 0, opacity: 1, ease: 'power3.out', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'top 28%', scrub: 0.8 } });
  }, []);

  return (
    <section id="about" ref={root} className="about" aria-labelledby="about-title">
      <div className="about__stage">
        <div className="wrap about__grid">
          <div className="about__copy">
            <p className="label mono">( 03 — About )</p>
            <h2 id="about-title" className="about__h">A computer science engineer who wants to see the <em>whole</em> system.</h2>
            <ol className="about__rail mono" aria-hidden="true">
              {CHAPTERS.map((c) => <li key={c.n} style={{ '--on': 0.35 }}><i />{c.n} {c.t}</li>)}
            </ol>
            <div className="about__chapters">
              {CHAPTERS.map((c) => (
                <p className="chap" key={c.n}><b className="mono"><i>{c.n}</i> / {c.t}</b>{c.body}</p>
              ))}
            </div>
            <ul className="facts">
              {FACTS.map(([k, v]) => (
                <li key={k}><span className="mono">{k}</span><span>{v}</span></li>
              ))}
            </ul>
          </div>

          <figure className="about__fig">
            <i className="about__disc" aria-hidden="true" />
            <div className="about__frame">
              <img className="about__photo" src="/portrait.webp" alt="Portrait of Subrata Saha, smiling, arms crossed, wearing a blue shirt" loading="lazy" width="768" height="900" />
              <i className="about__scan" aria-hidden="true" />
              <svg className="about__svg" viewBox="0 0 768 900" aria-hidden="true">
                <path className="about__box" d={BOX} fill="none" stroke="var(--ink)" strokeWidth="3" strokeLinecap="square" />
                <polyline className="about__mesh" points={LANDMARKS.map((p) => p.join(',')).join(' ')} fill="none" stroke="var(--ink)" strokeWidth="1" strokeOpacity=".6" />
                {LANDMARKS.map(([x, y], i) => <circle key={i} className="about__lm" cx={x} cy={y} r="6" fill="var(--bg)" stroke="var(--ink)" strokeWidth="2" />)}
                {CHAPTERS.map((c) => (
                  <g key={c.n}>
                    <circle cx={c.pt[0]} cy={c.pt[1]} r="9" fill="var(--bg)" stroke="var(--bg)" strokeWidth="2" className="about__ptdot" />
                    <path className="about__link" d={`M${c.pt[0]} ${c.pt[1]} L${c.tag[0] - 26} ${c.tag[1]} L${c.tag[0]} ${c.tag[1]}`} fill="none" stroke="var(--bg)" strokeWidth="3" />
                  </g>
                ))}
              </svg>
              {CHAPTERS.map((c) => (
                <span className="about__tag mono" key={c.n} style={{ left: `${(c.tag[0] / 768) * 100}%`, top: `${(c.tag[1] / 900) * 100}%` }}>{c.n} · {c.t}</span>
              ))}
            </div>
            <figcaption className="mono">fig. 01 · subject: Subrata Saha</figcaption>
          </figure>
        </div>
      </div>
    </section>
  );
}
