import { useRef } from 'react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { useSection } from '../hooks/useSection';
import { projects } from '../data/content';
import Logo from './Logo';

/* ------------------------------------------------------------------------------------
   Seven chapters. Each one has its own colour, layout, artwork and scroll reveal, but
   shares one world: flat spray colours on concrete, Anton type, sticker links.
   Copy and URLs come from data/content.js (inspected from the real repositories).
------------------------------------------------------------------------------------- */

const Draw = ({ d, w = 4, c = 'currentColor', className = '', ...r }) => (
  <path d={d} fill="none" stroke={c} strokeWidth={w} strokeLinecap="round" strokeLinejoin="round" pathLength="1" className={`draw ${className}`} {...r} />
);

const ArtVoyager = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    {[60, 120, 180, 240].map((y) => <Draw key={y} d={`M10 ${y} H390`} w={1.5} className="faint" />)}
    {[80, 160, 240, 320].map((x) => <Draw key={x} d={`M${x} 10 V290`} w={1.5} className="faint" />)}
    <rect x="10" y="10" width="380" height="280" rx="6" fill="none" stroke="currentColor" strokeWidth="4" />
    <Draw d="M45 245 C110 110 190 270 250 150 S340 70 360 48" w={7} c="var(--ac)" strokeDasharray="1" />
    <circle cx="45" cy="245" r="10" fill="var(--ac)" className="pulse" /><circle cx="360" cy="48" r="10" fill="var(--ac)" className="pulse" />
    <g transform="translate(325 230)"><circle r="30" fill="none" stroke="currentColor" strokeWidth="3.5" /><path d="M0 -24 L7 4 L0 0 L-7 4 Z" fill="currentColor" /><text y="-34" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="11" fill="currentColor">N</text></g>
    <text x="22" y="272" fontFamily="IBM Plex Mono" fontSize="12" fill="currentColor">SAFETY · DEMAND · SCAMS</text>
  </svg>
);
const ArtOmen = () => (
  <div className="art-term" aria-hidden="true">
    <div className="art-term__bar"><i /><i /><i /><span className="mono">omen — linux</span></div>
    <p><b>$</b> omen &quot;scaffold a fastapi + react app&quot;</p>
    <p className="dim">→ plan · 6 steps · client/ server/ isolated</p>
    <p className="dim">→ run · npm create vite@latest client</p>
    <p className="bad">✗ build failed · re-planning (1/2)</p>
    <p className="ok">✓ recovered · server up on :8000</p>
    <p><b>$</b> <span className="cur" /></p>
    <img className="art-term__logo" src="/work/omen.webp" alt="" loading="lazy" />
  </div>
);
const ArtLgpsm = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    {[[20, 40, 'APP'], [150, 40, 'API'], [280, 40, 'MONGO']].map(([x, y, t]) => (
      <g key={t}><rect x={x} y={y} width="100" height="56" rx="8" fill="none" stroke="currentColor" strokeWidth="4" /><text x={x + 50} y={y + 34} textAnchor="middle" fontFamily="Anton" fontSize="22" fill="currentColor">{t}</text></g>
    ))}
    <Draw d="M120 68 H150 M250 68 H280" w={4} c="var(--ac)" />
    <Draw d="M70 96 V150 H200 V96" w={3} />
    <g transform="translate(40 170)">
      <rect width="90" height="90" fill="none" stroke="currentColor" strokeWidth="4" />
      {[[10, 10], [60, 10], [10, 60]].map(([x, y]) => <rect key={`${x}${y}`} x={x} y={y} width="20" height="20" fill="currentColor" />)}
      {[[40, 40], [58, 52], [40, 62], [64, 70], [50, 78]].map(([x, y]) => <rect key={`${x}-${y}`} x={x} y={y} width="9" height="9" fill="currentColor" />)}
    </g>
    <g transform="translate(170 175)"><rect width="100" height="70" rx="6" fill="none" stroke="currentColor" strokeWidth="4" /><Draw d="M4 6 L50 42 L96 6" w={4} /></g>
    <g transform="translate(290 170)"><path d="M10 0 H90 Q100 0 100 10 V50 Q100 60 90 60 H40 L20 80 V60 H10 Q0 60 0 50 V10 Q0 0 10 0Z" fill="var(--ac)" stroke="currentColor" strokeWidth="4" /></g>
  </svg>
);
const ArtFacelock = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    <circle cx="200" cy="130" r="62" fill="none" stroke="currentColor" strokeWidth="5" />
    <Draw d="M96 270 C100 205 150 195 200 195 C250 195 300 205 304 270" w={5} />
    {Array.from({ length: 8 }, (_, i) => { const a = (i / 8) * 6.2832; return <circle key={i} cx={200 + Math.cos(a) * 104} cy={130 + Math.sin(a) * 104} r="8" fill="var(--ac)" stroke="currentColor" strokeWidth="3" className="pulse" style={{ animationDelay: `${i * 0.18}s` }} />; })}
    <circle cx="200" cy="130" r="8" fill="currentColor" />
    {['M60 60 V30 H90', 'M340 60 V30 H310', 'M60 230 V260 H90', 'M340 230 V260 H310'].map((d) => <Draw key={d} d={d} w={5} />)}
    <text x="200" y="292" textAnchor="middle" fontFamily="IBM Plex Mono" fontSize="12" fill="currentColor">9 HEAD DIRECTIONS · ENROLMENT</text>
  </svg>
);
const ArtAgni = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    {[[110, 170, 1], [250, 100, 0.8], [320, 200, 0.6]].map(([x, y, k], n) => (
      <g key={n} className="heat" style={{ transformOrigin: `${x}px ${y}px`, animationDelay: `${n * 0.6}s` }}>
        {[70, 50, 32, 16].map((r) => <circle key={r} cx={x} cy={y} r={r * k} fill={r === 16 ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="4" />)}
      </g>
    ))}
    <Draw d="M10 260 C90 230 150 250 220 235 S340 250 390 225" w={3.5} />
    <text x="14" y="30" fontFamily="IBM Plex Mono" fontSize="12" fill="currentColor">VIIRS · FIRMS · PERSISTENCE</text>
  </svg>
);
const ArtChain = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    {[[40, 'AUDIO'], [112, 'TEXT'], [184, 'MINUTES'], [256, 'SLACK']].map(([y, t], i) => (
      <g key={t} transform={`translate(${i % 2 ? 150 : 30} ${y})`}><rect width="210" height="48" rx="24" fill={i % 2 ? 'var(--ac)' : 'none'} stroke="currentColor" strokeWidth="4" /><text x="105" y="32" textAnchor="middle" fontFamily="Anton" fontSize="24" fill="currentColor">{t}</text></g>
    ))}
    {[88, 160, 232].map((y, i) => <Draw key={y} d={i % 2 ? `M260 ${y} C260 ${y + 12} 130 ${y + 8} 130 ${y + 24}` : `M130 ${y} C130 ${y + 12} 260 ${y + 8} 260 ${y + 24}`} w={5} />)}
    {[0, 1, 2, 3, 4, 5, 6].map((i) => <rect key={i} x={46 + i * 14} y={52 - (i % 3) * 6 - 6} width="5" height={14 + (i % 3) * 12} rx="2" fill="currentColor" className="bar" style={{ animationDelay: `${i * 0.12}s` }} transform="translate(0 -10)" />)}
  </svg>
);
const ArtWebguard = () => (
  <svg viewBox="0 0 400 300" className="art" aria-hidden="true">
    <Draw d="M200 20 L340 60 V150 C340 220 280 262 200 288 C120 262 60 220 60 150 V60 Z" w={6} />
    <g className="stamp" transform="rotate(-8 200 90)"><rect x="96" y="70" width="208" height="46" rx="6" fill="none" stroke="var(--ac)" strokeWidth="6" /><text x="200" y="105" textAnchor="middle" fontFamily="Anton" fontSize="34" fill="var(--ac)">SAFE</text></g>
    <g className="stamp" transform="rotate(5 200 150)" style={{ animationDelay: '0.2s' }}><rect x="70" y="128" width="260" height="46" rx="6" fill="none" stroke="#ffd60a" strokeWidth="6" /><text x="200" y="163" textAnchor="middle" fontFamily="Anton" fontSize="32" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="1">SUSPICIOUS</text></g>
    <g className="stamp" transform="rotate(-4 200 214)" style={{ animationDelay: '0.4s' }}><rect x="74" y="190" width="252" height="46" rx="6" fill="none" stroke="#ff3b1d" strokeWidth="6" /><text x="200" y="225" textAnchor="middle" fontFamily="Anton" fontSize="32" fill="#ff3b1d">MALICIOUS</text></g>
  </svg>
);

export const CH = {
  voyager: { bg: '#efe8d6', fg: '#0d0c0b', ac: '#ff3b1d', layout: 'A', reveal: 'tear', Art: ArtVoyager, tag: 'Hult Prize' },
  omen: { bg: '#0d0c0b', fg: '#efe8d6', ac: '#ffd60a', layout: 'B', reveal: 'slices', Art: ArtOmen, tag: 'Terminal agent' },
  lgpsm: { bg: '#ffd60a', fg: '#0d0c0b', ac: '#ff3b1d', layout: 'A', reveal: 'marker', Art: ArtLgpsm, tag: 'Internship' },
  facelock: { bg: '#11b5e4', fg: '#0d0c0b', ac: '#efe8d6', layout: 'C', reveal: 'iris', Art: ArtFacelock, tag: 'Linux · SDK' },
  agni: { bg: '#ff3b1d', fg: '#0d0c0b', ac: '#ffd60a', layout: 'B', reveal: 'dome', Art: ArtAgni, tag: 'Smart India Hackathon' },
  chainflow: { bg: '#ff4fa3', fg: '#0d0c0b', ac: '#efe8d6', layout: 'D', reveal: 'chain', Art: ArtChain, tag: 'Workflow' },
  webguard: { bg: '#efe8d6', fg: '#0d0c0b', ac: '#11b5e4', layout: 'A', reveal: 'shutter', Art: ArtWebguard, tag: 'Security ML' },
};
const TITLE_FROM = {
  tear: { yPercent: -130, rotate: () => gsap.utils.random(-25, 25), opacity: 0 },
  slices: { yPercent: 130, opacity: 0 },
  marker: { xPercent: -90, opacity: 0, skewX: -20 },
  iris: { scale: 3.4, opacity: 0 },
  dome: { yPercent: 120, rotate: () => gsap.utils.random(-12, 12), opacity: 0 },
  chain: { xPercent: 120, opacity: 0 },
  shutter: { rotationX: -95, opacity: 0, transformOrigin: '50% 100%', transformPerspective: 700 },
};
const BG_FROM = {
  tear: { yPercent: 100 }, slices: null, marker: { clipPath: 'polygon(0 0, 0 0, -10% 100%, 0 100%)' },
  iris: { clipPath: 'circle(0% at 50% 55%)' }, dome: { clipPath: 'ellipse(55% 0% at 50% 100%)' },
  chain: { xPercent: 100, skewX: -12 }, shutter: { clipPath: 'inset(50% 0% 50% 0%)' },
};
const BG_TO = {
  tear: { yPercent: 0, ease: 'power2.out' }, marker: { clipPath: 'polygon(0 0, 110% 0, 100% 100%, 0 100%)' },
  iris: { clipPath: 'circle(80% at 50% 55%)' }, dome: { clipPath: 'ellipse(135% 145% at 50% 100%)' },
  chain: { xPercent: 0, skewX: 0 }, shutter: { clipPath: 'inset(0% 0% 0% 0%)' },
};

function Chapter({ p, i }) {
  const root = useRef(null);
  const c = CH[p.id];

  useSection(root, ({ cleanups, scope }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const r = c.reveal;
    const trig = { trigger: scope, start: 'top 96%', end: 'top 24%', scrub: 0.8 };
    const bg = scope.querySelector('.ch__bg');
    if (r === 'slices') {
      gsap.fromTo(bg.children, { scaleX: 0 }, { scaleX: 1, transformOrigin: '0 50%', stagger: 0.12, ease: 'power3.inOut', scrollTrigger: trig });
    } else {
      gsap.fromTo(bg, BG_FROM[r], { ...BG_TO[r], ease: BG_TO[r].ease || 'none', scrollTrigger: trig });
    }
    // title letters arrive in this chapter's own way, only once the colour is mostly there
    const sp = splitText(scope.querySelector('.ch__title'), 'chars');
    cleanups.push(sp.revert);
    gsap.fromTo(sp.chars, TITLE_FROM[r], { yPercent: 0, xPercent: 0, rotate: 0, scale: 1, skewX: 0, rotationX: 0, opacity: 1, stagger: { each: 0.05, from: r === 'iris' ? 'center' : 'start' }, ease: r === 'shutter' ? 'back.out(1.6)' : 'power3.out', scrollTrigger: { trigger: scope, start: 'top 62%', end: 'top 22%', scrub: 0.8 } });
    gsap.fromTo(scope.querySelectorAll('.ch__in'), { y: 40, opacity: 0 }, { y: 0, opacity: 1, stagger: 0.1, ease: 'power2.out', scrollTrigger: { trigger: scope, start: 'top 52%', end: 'top 12%', scrub: 0.8 } });
    gsap.to(scope.querySelectorAll('.draw'), { strokeDashoffset: 0, stagger: 0.08, ease: 'power1.inOut', scrollTrigger: { trigger: scope, start: 'top 48%', end: 'top 0%', scrub: 0.9 } });
    gsap.fromTo(scope.querySelector('.ch__shot'), { y: 90, rotate: (i % 2 ? 9 : -9), opacity: 0 }, { y: 0, rotate: i % 2 ? 3 : -3, opacity: 1, ease: 'back.out(1.4)', scrollTrigger: { trigger: scope, start: 'top 40%', end: 'top 5%', scrub: 0.8 } });
    gsap.fromTo(scope.querySelectorAll('.ch__links .sticker'), { scale: 0, rotate: 'random(-40,40)' }, { scale: 1, rotate: (k) => (k ? 2 : -2), duration: 0.7, stagger: 0.12, ease: 'back.out(2.4)', scrollTrigger: { trigger: scope.querySelector('.ch__links'), start: 'top 92%', toggleActions: 'play none none reverse' } });
    // a second, slower drift keeps the big numeral alive while you read
    gsap.fromTo(scope.querySelector('.ch__num'), { yPercent: 18 }, { yPercent: -18, ease: 'none', scrollTrigger: { trigger: scope, start: 'top bottom', end: 'bottom top', scrub: true } });
  }, []);

  const Art = c.Art;
  const gh = p.links.find((l) => /repo/i.test(l.label));
  const live = p.links.find((l) => /live/i.test(l.label));
  return (
    <section ref={root} id={`ch-${p.id}`} className={`ch ch--${c.layout} ch--${p.id}`} style={{ '--bg': c.bg, '--fg': c.fg, '--ac': c.ac }} aria-labelledby={`t-${p.id}`}>
      <div className="ch__bg" aria-hidden="true">{c.reveal === 'slices' && [0, 1, 2, 3, 4, 5].map((k) => <span key={k} />)}</div>
      <span className="ch__num" aria-hidden="true">{p.n}</span>
      <p className="ch__tag mono ch__in"><b>Chapter {p.n}</b> · {c.tag} · {p.status}</p>
      <h2 id={`t-${p.id}`} className="ch__title">{p.title}</h2>
      <p className="ch__kicker ch__in">{p.kicker}</p>
      <div className="ch__art ch__in"><Art /></div>
      {p.img && (
        <figure className="ch__shot">
          <span className="tape" aria-hidden="true" />
          <img src={p.img} alt={`${p.title} screenshot`} loading="lazy" decoding="async" />
          <figcaption className="mono">{live ? 'the live deployment' : 'project mark'}</figcaption>
        </figure>
      )}
      <div className="ch__body">
        <p className="ch__sum ch__in">{p.summary}</p>
        <ul className="ch__list ch__in">{p.approach.slice(0, 3).map((a) => <li key={a}>{a}</li>)}</ul>
        <ul className="ch__chips ch__in">{p.stack.map((t) => <li key={t}><Logo name={t} />{t}</li>)}</ul>
        {p.metric && <p className="ch__metric ch__in"><b>{p.metric.value}</b><span className="mono">{p.metric.label}</span></p>}
        <p className="ch__role ch__in mono"><b>My part —</b> {p.role}</p>
        <p className="ch__note ch__in mono"><b>Honest note —</b> {p.note}</p>
      </div>
      <div className="ch__links">
        {gh && <a className="sticker" href={gh.href} target="_blank" rel="noopener noreferrer" style={{ '--r': '-2deg' }}>GitHub <span aria-hidden="true">↗</span></a>}
        {live && <a className="sticker sticker--red" href={live.href} target="_blank" rel="noopener noreferrer" style={{ '--r': '2deg' }}>Live demo <span aria-hidden="true">↗</span></a>}
      </div>
    </section>
  );
}

export default function Chapters() {
  return (
    <div id="work" className="chapters">
      {projects.map((p, i) => <Chapter key={p.id} p={p} i={i} />)}
    </div>
  );
}
