import { useRef } from 'react';
import { gsap, ScrollTrigger, prefersReducedMotion } from '../animation/gsap';
import { splitText } from '../animation/split';
import { scrollToTarget } from '../animation/smoothScroll';
import { dab, PAINT } from '../animation/spray';
import { useSection } from '../hooks/useSection';
import { site } from '../data/content';

const CREDITS = [
  ['Direction & engineering', 'Subrata Saha'],
  ['Intelligence', 'PyTorch · scikit-learn · Hugging Face · Ollama · RAG'],
  ['Interface', 'React · GSAP · Three.js · Lenis'],
  ['Systems', 'Linux · Rust · FastAPI · Docker · MongoDB'],
  ['Shot on location at', 'RCC Institute of Information Technology'],
];
const TAG = 'M120 20 C80 -8 20 12 26 60 C32 104 110 112 112 160 C114 206 52 210 18 182';
const TAG2 = 'M250 20 C210 -8 150 12 156 60 C162 104 240 112 242 160 C244 206 182 210 148 182';
const ICON = {
  Email: <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm1.6 2L12 12.6 19.4 7H4.6Z" />,
  GitHub: <path d="M12 .5a11.5 11.5 0 0 0-3.64 22.41c.58.1.79-.25.79-.56v-2c-3.2.7-3.87-1.37-3.87-1.37-.52-1.33-1.28-1.69-1.28-1.69-1.05-.71.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.17 1.18a11 11 0 0 1 5.78 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.19 1.83 1.19 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.56A11.5 11.5 0 0 0 12 .5Z" />,
  LinkedIn: <path d="M4.98 3.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5ZM3 9.75h4V21H3V9.75Zm6.5 0h3.8v1.54h.05c.53-1 1.82-2.04 3.75-2.04 4 0 4.75 2.63 4.75 6.05V21h-4v-4.95c0-1.18-.02-2.7-1.65-2.7-1.65 0-1.9 1.29-1.9 2.62V21h-4V9.75Z" />,
};
const PAL = [PAINT.red, PAINT.yellow, PAINT.cyan, PAINT.pink];

/**
 * End credits. The roll is scroll-driven, and everything on it is alive: the title drops in letter by letter,
 * each credit enters its own way as it crosses the screen (tracking collapses, values slide from alternating sides,
 * rows dim as they leave), the closing line slams in word by word, paint dust drifts behind it all, and reaching the
 * end fires a paint burst. The links pop in last.
 */
export default function Contact() {
  const root = useRef(null);
  useSection(root, ({ scope, cleanups }) => {
    if (prefersReducedMotion()) { scope.classList.add('is-static'); return; }
    const stage = scope.querySelector('.cr__stage');
    const roll = scope.querySelector('.cr__roll');

    // --- the roll itself (pinned, scrubbed) ---
    const tl = gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top top', end: '+=260%', pin: true, scrub: 0.9, anticipatePin: 1, invalidateOnRefresh: true } });
    const move = tl.fromTo(roll, { y: () => window.innerHeight * 0.92 }, { y: () => -(roll.offsetHeight - window.innerHeight * 0.97), duration: 1 }, 0);

    // --- title: letters drop and bounce, the red name shakes into place ---
    const big = scope.querySelectorAll('.cr__big > span, .cr__big > .cr__l1');
    const l1 = splitText(scope.querySelector('.cr__l1'), 'chars');
    const l2 = splitText(scope.querySelector('.cr__l2'), 'chars');
    cleanups.push(l1.revert, l2.revert);
    gsap.set([l1.chars, l2.chars], { opacity: 0 });
    // "A film by" stutters on like a projector warming up (stepped flicker); the name arrives as a mis-registered
    // screen-print, cyan and pink plates far apart, that slide together until they lock onto the red.
    gsap.timeline({ defaults: { ease: 'none' }, scrollTrigger: { trigger: stage, start: 'top 80%', end: 'top 5%', scrub: true } })
      .fromTo(l1.chars, { opacity: 0 }, { opacity: 1, duration: 0.5, stagger: 0.07, ease: 'steps(7)' }, 0)
      .fromTo(l2.chars, { opacity: 0, scaleY: 1.18, textShadow: (i) => `${i % 2 ? 46 : -46}px 0 0 #11b5e4, ${i % 2 ? -34 : 34}px 8px 0 #ff4fa3` },
        { opacity: 1, scaleY: 1, textShadow: '0px 0px 0 rgba(17,181,228,0), 0px 0px 0 rgba(255,79,163,0)', duration: 0.7, stagger: 0.05, ease: 'power3.inOut' }, 0.45);
    gsap.fromTo(scope.querySelector('.cr__small'), { letterSpacing: '0.9em', opacity: 0 }, { letterSpacing: '0.08em', opacity: 1, ease: 'expo.out', scrollTrigger: { trigger: stage, start: 'top 80%', end: 'top 20%', scrub: true } });

    // Each element gets its own ScrollTrigger whose start/end are the scroll positions at which that element's top
    // crosses given heights of the screen as the roll moves (no containerAnimation, nothing can silently fail to fire).
    const at = (el, frac) => () => {
      const st = tl.scrollTrigger, vh = window.innerHeight;
      const y0 = vh * 0.92, y1 = -(roll.offsetHeight - vh * 0.97);
      const t = (frac * vh - el.offsetTop - y0) / (y1 - y0);
      return st.start + Math.min(1, Math.max(0, t)) * (st.end - st.start);
    };
    const scrub = (el, from, to) => ({ trigger: stage, start: at(el, from), end: at(el, to), scrub: true, invalidateOnRefresh: true });

    // Each credit is a departure board: the value flips through random letters and locks in left to right.
    const GLYPH = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&';
    scope.querySelectorAll('.cr__list > div').forEach((row, i) => {
      const dt = row.querySelector('dt'), dd = row.querySelector('dd');
      const real = dd.textContent, n = real.length, proxy = { p: 0 };
      dd.setAttribute('aria-label', real);
      gsap.fromTo(dt, { opacity: 0, clipPath: 'inset(0 100% 0 0)' }, { opacity: 1, clipPath: 'inset(0 0% 0 0)', ease: 'none', scrollTrigger: scrub(row, 0.97, 0.78) });
      gsap.fromTo(proxy, { p: 0 }, {
        p: 1, ease: 'none', scrollTrigger: scrub(row, 0.92, 0.5),
        onUpdate() {
          const lock = proxy.p * (n + 6) - 3; // chars before `lock` are settled
          let out = '';
          for (let k = 0; k < n; k++) { const c = real[k]; out += (k < lock || !/[A-Za-z0-9]/.test(c)) ? c : GLYPH[(Math.random() * GLYPH.length) | 0]; }
          if (dd.textContent !== out) dd.textContent = out;
          dd.style.opacity = proxy.p < 0.02 ? 0 : 1;
        },
        onReverseComplete() { dd.textContent = real; },
      });
      gsap.to(row, { opacity: 0.35, filter: 'blur(3px)', ease: 'none', scrollTrigger: scrub(row, 0.2, -0.05) });
    });

    // --- the closing statement slams in word by word ---
    const sayEl = scope.querySelector('.cr__say');
    const say = splitText(sayEl, 'words');
    cleanups.push(say.revert);
    // The closing line is a ransom note: every word is a different cut-out, slapped on the wall one after another.
    gsap.fromTo(say.words, { y: -260, scale: 2.3, rotate: (i) => (i % 2 ? 24 : -24), opacity: 0 },
      { y: 0, scale: 1, rotate: (i) => [-4, 3, -2, 4, -3][i % 5], opacity: 1, stagger: 0.2, ease: 'expo.in', scrollTrigger: scrub(sayEl, 0.97, 0.5) });
    const sigEl = scope.querySelector('.cr__sig');
    gsap.fromTo(sigEl, { opacity: 0 }, { opacity: 1, ease: 'none', scrollTrigger: scrub(sigEl, 0.98, 0.9) });
    gsap.to(scope.querySelectorAll('.cr__sig .draw'), { strokeDashoffset: 0, stagger: 0.15, ease: 'power1.inOut', scrollTrigger: scrub(sigEl, 0.9, 0.5) });

    // links: tied to the roll's own progress (not a position trigger), so they are guaranteed to be in by the end
    tl.fromTo(scope.querySelectorAll('.cr__links .sticker'), { scale: 3, opacity: 0, rotate: () => gsap.utils.random(-30, 30) }, { scale: 1, opacity: 1, rotate: (i) => [-3, 2, -2][i % 3], stagger: 0.03, duration: 0.06, ease: 'power4.in' }, 0.86)
      .fromTo(roll, { x: 0 }, { x: 0, keyframes: { x: [0, -9, 8, -5, 3, 0] }, duration: 0.05, ease: 'none', immediateRender: false }, 0.93);

    // --- paint dust drifting behind the roll, and a burst at the end ---
    const cvs = scope.querySelector('.cr__dust'), cx = cvs.getContext('2d');
    let W = 0, H = 0, live = false, burstDone = false;
    const fit = () => { W = cvs.width = cvs.clientWidth; H = cvs.height = cvs.clientHeight; };
    fit(); window.addEventListener('resize', fit);
    const dust = Array.from({ length: 110 }, () => ({ x: Math.random() * W, y: Math.random() * H, vy: -(0.25 + Math.random() * 0.8), ph: Math.random() * 6.28, s: 1.2 + Math.random() * 3, c: (Math.random() * 4) | 0, a: 0.25 + Math.random() * 0.5 }));
    const parts = [];
    const burst = () => {
      for (let i = 0; i < 140; i++) { const a = Math.random() * 6.2832, sp = 3 + Math.random() * 11; parts.push({ x: W / 2, y: H * 0.55, vx: Math.cos(a) * sp, vy: Math.sin(a) * sp - 2, l: 50 + Math.random() * 40, m: 90, s: 2 + Math.random() * 5, c: (Math.random() * 4) | 0 }); }
    };
    const tick = () => {
      if (!live) return;
      cx.clearRect(0, 0, W, H);
      dust.forEach((p) => { p.y += p.vy; p.x += Math.sin(p.ph += 0.02) * 0.4; if (p.y < -10) { p.y = H + 10; p.x = Math.random() * W; } cx.globalAlpha = p.a; cx.fillStyle = PAL[p.c]; cx.fillRect(p.x, p.y, p.s, p.s); });
      for (let i = parts.length - 1; i >= 0; i--) { const p = parts[i]; p.x += p.vx; p.y += p.vy; p.vx *= 0.96; p.vy = p.vy * 0.96 + 0.18; p.l -= 1; if (p.l <= 0) { parts.splice(i, 1); continue; } cx.globalAlpha = Math.min(1, p.l / 30); cx.fillStyle = PAL[p.c]; cx.fillRect(p.x, p.y, p.s, p.s); }
      cx.globalAlpha = 1;
    };
    gsap.ticker.add(tick);
    ScrollTrigger.create({ trigger: stage, start: 'top bottom', end: 'bottom top', onToggle: (s) => { live = s.isActive; } });
    ScrollTrigger.create({ trigger: stage, start: 'top top', end: '+=260%', onUpdate: (s) => { if (s.progress > 0.88 && !burstDone) { burstDone = true; burst(); } if (s.progress < 0.8) burstDone = false; } });
    cleanups.push(() => { gsap.ticker.remove(tick); window.removeEventListener('resize', fit); });
  }, []);

  const links = [
    { label: 'Email', href: `mailto:${site.email}`, cls: 'sticker--red' },
    { label: 'GitHub', href: site.github, cls: '' },
    { label: 'LinkedIn', href: site.linkedin, cls: 'sticker--cyan' },
  ].filter((l) => l.href && !l.href.endsWith(':'));

  return (
    <section id="contact" ref={root} className="cr" aria-labelledby="contact-title">
      <div className="cr__stage">
        <canvas className="cr__dust" aria-hidden="true" />
        <svg className="cr__spark cr__spark--a" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16Z" fill="#ffd60a" stroke="#0d0c0b" strokeWidth="2.5" strokeLinejoin="round" /></svg>
        <svg className="cr__spark cr__spark--b" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16Z" fill="#11b5e4" stroke="#0d0c0b" strokeWidth="2.5" strokeLinejoin="round" /></svg>
        <svg className="cr__spark cr__spark--c" viewBox="0 0 40 40" aria-hidden="true"><path d="M20 2 L24 16 L38 20 L24 24 L20 38 L16 24 L2 20 L16 16Z" fill="#ff4fa3" stroke="#0d0c0b" strokeWidth="2.5" strokeLinejoin="round" /></svg>
        <div className="cr__roll">
          <p className="cr__small mono">( 06 — The end credits )</p>
          <h2 id="contact-title" className="cr__big"><span className="cr__l1">A film by</span><br /><span className="cr__l2">Subrata Saha</span></h2>
          <dl className="cr__list">
            {CREDITS.map(([k, v]) => <div key={k}><dt className="mono">{k}</dt><dd>{v}</dd></div>)}
          </dl>
          <p className="cr__say">Let&apos;s make something<br />that thinks.</p>
          <svg className="cr__sig" viewBox="0 0 380 230" aria-hidden="true">
            <path className="draw" d={TAG} fill="none" stroke="#ff3b1d" strokeWidth="22" strokeLinecap="round" pathLength="1" />
            <path className="draw" d={TAG2} fill="none" stroke="#ff3b1d" strokeWidth="22" strokeLinecap="round" pathLength="1" />
            <path className="draw" d={TAG} fill="none" stroke="#ffd60a" strokeWidth="6" strokeLinecap="round" pathLength="1" transform="translate(-4 -4)" />
            <path className="draw" d={TAG2} fill="none" stroke="#ffd60a" strokeWidth="6" strokeLinecap="round" pathLength="1" transform="translate(-4 -4)" />
          </svg>
          <div className="cr__links">
            {links.map((l) => (
              <a key={l.label} className={`sticker ${l.cls}`} href={l.href} target={l.href.startsWith('http') ? '_blank' : undefined} rel="noopener noreferrer"><svg className="sticker__ic" viewBox="0 0 24 24" aria-hidden="true" fill="currentColor">{ICON[l.label]}</svg>{l.label} <span aria-hidden="true">↗</span></a>
            ))}
          </div>
          <p className="cr__foot mono">© {new Date().getFullYear()} Subrata Saha · React · GSAP · Three.js · Lenis · spray paint (simulated) · <button onClick={() => scrollToTarget(0)}>Back to the wall ↑</button></p>
        </div>
      </div>
    </section>
  );
}
