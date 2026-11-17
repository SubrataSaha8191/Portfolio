import { useEffect, useRef } from 'react';
import { useGSAP } from '@gsap/react';
import { gsap, prefersReducedMotion } from '../animation/gsap';
import * as A from '../gl/artwork';

/* ------------------------------------------------------------------
   Opening sequence: a piece of computational artwork is drawn one element
   at a time, resolves into a lens (the "eye" of the portrait), and the lens
   pupil becomes the origin of the hole that opens onto the hero.

   One master timeline:
     build()   phases 1-4: awakening, construction, complexity, signature
     gate      waits (only if needed) for the real readiness condition
     reveal()  the artwork becomes the transition
   Nothing here touches React state per frame; the tweens write to the DOM.
------------------------------------------------------------------- */

const STAGES = ['awakening', 'construction', 'complexity', 'signature'];

function build(q, setStage) {
  const tl = gsap.timeline({ defaults: { ease: 'power3.inOut' } });
  const draw = (sel, vars, at) => tl.to(q(sel), { strokeDashoffset: 0, ...vars }, at);
  const pop = (sel, vars, at) => tl.fromTo(q(sel), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, ...vars }, at);

  tl.addLabel('awakening', 0.2).call(setStage, [0], 'awakening');
  // 1 · awakening: a point of light, then single lines leave it
  pop('[data-spark]', { duration: 0.5, ease: 'back.out(3)' }, 'awakening')
    .fromTo(q('[data-pulse]'), { scale: 0.2, opacity: 0.9, transformOrigin: '50% 50%' }, { scale: 3.2, opacity: 0, duration: 1.1, ease: 'power2.out' }, 'awakening')
    .to(q('[data-axis]'), { strokeDashoffset: 0, duration: 1.0, stagger: { each: 0.16, from: 'start' }, ease: 'expo.out' }, 'awakening+=0.35');

  // 2 · construction: rotating circles, ticks, intersecting geometry, organic contours
  tl.addLabel('construction', 0.95).call(setStage, [1], 'construction');
  draw('[data-ring]', { duration: 1.1, stagger: 0.11, ease: 'power3.inOut' }, 'construction');
  tl.fromTo(q('[data-ring]'), { rotation: -140, svgOrigin: '500 500' }, { rotation: 0, svgOrigin: '500 500', duration: 1.2, stagger: 0.11, ease: 'power3.out' }, 'construction');
  draw('[data-ticks]', { duration: 1.3, ease: 'power2.inOut' }, 'construction+=0.1');
  draw('[data-vesica]', { duration: 1.2, stagger: 0.15, ease: 'expo.inOut' }, 'construction+=0.25');
  tl.fromTo(q('[data-vesica-g]'), { rotation: -35, svgOrigin: '500 500' }, { rotation: 0, svgOrigin: '500 500', duration: 1.5, ease: 'expo.out' }, 'construction+=0.25');
  draw('[data-diag]', { duration: 1.0, stagger: 0.1, ease: 'power2.out' }, 'construction+=0.35');
  draw('[data-contour]', { duration: 1.3, stagger: { each: 0.08, from: 'center' }, ease: 'sine.inOut' }, 'construction+=0.4');
  pop('[data-cross]', { duration: 0.5, ease: 'back.out(3)' }, 'construction+=0.9');

  // 3 · complexity: parametric curve, lattice, bold structure, orbiting dots
  tl.addLabel('complexity', 1.75).call(setStage, [2], 'complexity');
  draw('[data-rose]', { duration: 1.5, ease: 'power2.inOut' }, 'complexity');
  draw('[data-edge]', { duration: 0.8, stagger: 0.12, ease: 'power2.out' }, 'complexity+=0.1');
  tl.fromTo(q('[data-node]'), { scale: 0, opacity: 0, transformOrigin: '50% 50%' }, { scale: 1, opacity: 1, duration: 0.5, stagger: { each: 0.025, from: 'random' }, ease: 'back.out(2.5)' }, 'complexity+=0.2');
  draw('[data-bold]', { duration: 1.0, stagger: 0.15, ease: 'expo.inOut' }, 'complexity+=0.3');
  draw('[data-limearc]', { duration: 0.9, ease: 'expo.out' }, 'complexity+=0.55');
  tl.fromTo(q('[data-orbit]'), { opacity: 0 }, { opacity: 1, duration: 0.3, stagger: 0.1 }, 'complexity+=0.3');
  q('[data-orbit]').forEach((el, i) => {
    tl.to(el, { motionPath: { path: q('[data-contour]')[3 + i * 2], align: q('[data-contour]')[3 + i * 2], alignOrigin: [0.5, 0.5] }, duration: 1.9, ease: 'power1.inOut' }, 'complexity+=0.3');
  });
  // slow counter-rotation of the contour layers keeps the whole drawing alive
  tl.to(q('[data-contours-g]'), { rotation: 7, svgOrigin: '500 500', duration: 3.4, ease: 'none' }, 'construction+=0.4');

  // 4 · signature: everything quiets, the lens resolves
  tl.addLabel('signature', 2.85).call(setStage, [3], 'signature');
  tl.to(q('.fine'), { opacity: 0.3, duration: 0.8, ease: 'power2.inOut' }, 'signature')
    .to(q('[data-orbit]'), { opacity: 0, duration: 0.3 }, 'signature')
    .to(q('[data-almond]'), { strokeDashoffset: 0, duration: 1.0, ease: 'expo.inOut' }, 'signature')
    .to(q('[data-iris]'), { strokeDashoffset: 0, duration: 0.9, stagger: 0.1, ease: 'expo.inOut' }, 'signature+=0.15')
    .to(q('[data-irisray]'), { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, 'signature+=0.25')
    .fromTo(q('[data-pupil]'), { scale: 0.4 }, { scale: 1, duration: 0.8, ease: 'elastic.out(1, 0.5)', transformOrigin: '50% 50%' }, 'signature+=0.35')
    .fromTo(q('[data-cap]'), { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.1, ease: 'power2.out' }, 'signature+=0.5')
    .to(q('[data-lens-g]'), { scale: 1.035, svgOrigin: '500 500', duration: 1.2, ease: 'sine.inOut' }, 'signature+=0.3');
  return tl;
}

function reveal(root, q, hole, onReveal, vp) {
  const apply = () => {
    root.style.setProperty('--r', hole.r + 'px');
    const d = hole.r * 2 + 'px';
    hole.ring.style.width = d;
    hole.ring.style.height = d;
  };
  const tl = gsap.timeline();
  tl.addLabel('reveal')
    .to(q('[data-cap], .fine'), { opacity: 0, duration: 0.45, ease: 'power2.in' }, 'reveal')
    // camera-like push through the lens
    .to(q('[data-art]'), { scale: 14, svgOrigin: '500 500', duration: 1.5, ease: 'power3.in' }, 'reveal')
    .to(q('[data-pupil]'), { opacity: 0, duration: 0.12 }, 'reveal+=0.12')
    .set(hole.ring, { opacity: 1 }, 'reveal+=0.12')
    .to(hole, { r: vp.maxR, duration: 1.4, ease: 'expo.inOut', onUpdate: apply }, 'reveal+=0.12')
    .to(q('[data-art]'), { opacity: 0, duration: 0.45, ease: 'power1.in' }, 'reveal+=0.95')
    .to(hole.ring, { opacity: 0, duration: 0.5 }, 'reveal+=1.1')
    .call(onReveal, null, 'reveal+=0.3');
  return tl;
}

export default function Preloader({ glInfo, onReveal, onDone }) {
  const root = useRef(null);
  const ring = useRef(null);
  const stageEl = useRef(null);
  const master = useRef(null);
  const ready = useRef(false);
  const waiting = useRef(false);
  const fontsOk = useRef(false);
  const alive = useRef(true);
  const glRef = useRef(glInfo);
  glRef.current = glInfo;
  const cb = useRef({ onReveal, onDone });
  cb.current = { onReveal, onDone };

  // readiness = fonts + portrait sampled (or WebGL fallback chosen). Never a fake percentage.
  useEffect(() => {
    document.fonts?.ready.then(() => { fontsOk.current = true; check(); });
    const t = setTimeout(() => { fontsOk.current = true; check(); }, 2500);
    return () => clearTimeout(t);
    // eslint-disable-next-line
  }, []);
  useEffect(() => { check(); /* eslint-disable-next-line */ }, [glInfo]);
  function check() {
    ready.current = !!glRef.current && fontsOk.current;
    if (ready.current && waiting.current && master.current) {
      waiting.current = false;
      master.current.play();
    }
  }

  const { contextSafe } = useGSAP(
    () => {
      alive.current = true;
      const el = root.current;
      const q = gsap.utils.selector(el);
      const reduced = prefersReducedMotion();
      const w = window.innerWidth, h = window.innerHeight;
      const lowPower = w < 820 || (navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 4;
      const hole = { r: 0, ring: ring.current };
      const vp = { maxR: Math.hypot(w, h) / 2 + 40 };
      const pupilPx = (24 * Math.max(w, h)) / 1000;
      hole.r = pupilPx;
      el.style.setProperty('--r', '0px');
      gsap.set(ring.current, { opacity: 0 });

      const setStage = (i) => { if (stageEl.current) stageEl.current.textContent = STAGES[i]; };
      const finish = () => {
        if (!alive.current) return;
        el.style.visibility = 'hidden';
        cb.current.onDone();
      };

      if (reduced) {
        // short, still-coherent alternative: the finished lens, then a clip wipe
        gsap.set(q('[data-d]'), { strokeDashoffset: 0 });
        gsap.set(q('[data-n], [data-spark], [data-cap], [data-pupil]'), { opacity: 1 });
        gsap.set(q('.fine'), { opacity: 0.3 });
        setStage(3);
        const m = gsap.timeline({ onComplete: finish });
        master.current = m;
        m.to({}, { duration: 0.5 })
          .add(() => { if (!ready.current) { waiting.current = true; m.pause(); } })
          .call(() => cb.current.onReveal())
          .to(el, { opacity: 0, duration: 0.45 });
        return;
      }

      const m = gsap.timeline({ onComplete: finish, delay: 0.1 });
      master.current = m;
      const b = build(q, setStage);
      m.add(b, 0).addLabel('hold');
      m.call(() => { if (!ready.current) { waiting.current = true; m.pause(); } }, null, 'hold+=0.2');
      m.add(reveal(el, q, hole, () => cb.current.onReveal(), vp), 'hold+=0.21');
      m.timeScale(lowPower ? 1.5 : 1.2); // brisk hand-off to the hero; lighter on small / weak devices
    },
    { scope: root, dependencies: [] }
  );

  const skip = contextSafe(() => {
    const m = master.current;
    if (!m || m.timeScale() >= 3) return;
    gsap.to(m, { timeScale: 3.6, duration: 0.3, ease: 'power2.out' });
  });

  useEffect(() => {
    const key = (e) => {
      if (e.key === 'Enter' || e.key === 'Escape' || e.key === ' ') { e.preventDefault(); skip(); }
    };
    window.addEventListener('keydown', key);
    return () => { alive.current = false; window.removeEventListener('keydown', key); };
    // eslint-disable-next-line
  }, []);

  return (
    <div ref={root} className="pre" role="status" aria-label="Loading portfolio">
      <div className="pre__veil" />
      <svg className="art" viewBox="0 0 1000 1000" preserveAspectRatio="xMidYMid slice" aria-hidden="true" focusable="false">
        <g data-art>
          {/* structure: axes, diagonals, tick ring */}
          <g className="fine" fill="none" stroke="var(--ink)" strokeWidth="1">
            {A.axes.map((d) => <path key={d} d={d} pathLength="1" data-d data-axis strokeOpacity=".5" />)}
            {A.diagonals.map((d) => <path key={d} d={d} pathLength="1" data-d data-diag strokeOpacity=".16" />)}
            <path d={A.ticks} pathLength="1" data-d data-ticks strokeOpacity=".6" />
          </g>

          {/* organic: topographic contours */}
          <g data-contours-g className="fine" fill="none" stroke="var(--ink)" strokeWidth=".9">
            {A.contours.map((d, i) => <path key={i} d={d} pathLength="1" data-d data-contour strokeOpacity={0.3 + (i % 3) * 0.12} />)}
          </g>

          {/* geometry: concentric + vesica circles */}
          <g fill="none" stroke="var(--ink)" strokeWidth="1.2">
            {A.rings.map((r) => <circle key={r} cx="500" cy="500" r={r} pathLength="1" data-d data-ring className="fine" strokeOpacity=".55" />)}
            <g data-vesica-g className="fine">
              {A.vesica.map(([cx, cy, r]) => <circle key={cx} cx={cx} cy={cy} r={r} pathLength="1" data-d data-vesica strokeOpacity=".7" />)}
            </g>
          </g>

          {/* parametric rose */}
          <path className="fine" d={A.rose} pathLength="1" data-d data-rose fill="none" stroke="var(--ink)" strokeWidth=".8" strokeOpacity=".55" />

          {/* neural lattice */}
          <g className="fine" fill="none" stroke="var(--ink)" strokeWidth=".6" strokeOpacity=".4">
            {[...A.left.edges, ...A.right.edges].map((d, i) => <path key={i} d={d} pathLength="1" data-d data-edge />)}
          </g>
          <g className="fine" fill="var(--ink)">
            {A.nodes.map(([x, y], i) => <circle key={i} cx={x} cy={y} r={i % 5 === 0 ? 4.5 : 2.8} data-n data-node fill={i % 7 === 0 ? 'var(--lime)' : 'var(--ink)'} />)}
          </g>

          {/* bold structural strokes + accent */}
          <g data-bold-g fill="none" strokeLinecap="round">
            {A.boldArcs.map((d, i) => <path key={i} d={d} pathLength="1" data-d data-bold stroke="var(--ink)" strokeWidth={i === 0 ? 7 : 4} />)}
            <path d={A.limeArc} pathLength="1" data-d data-limearc stroke="var(--lime)" strokeWidth="3" />
          </g>
          <path className="fine" d={A.crosses} data-n data-cross fill="none" stroke="var(--orange)" strokeWidth="1.5" />

          {/* orbiting dots travel along contour curves */}
          {[0, 1, 2].map((i) => <circle key={i} r="4.5" data-n data-orbit fill={i === 1 ? 'var(--orange)' : 'var(--lime)'} />)}

          {/* signature: the lens */}
          <g data-lens-g fill="none">
            <path d={A.almond} pathLength="1" data-d data-almond stroke="var(--ink)" strokeWidth="3.5" strokeLinejoin="round" />
            <circle cx="500" cy="500" r="128" pathLength="1" data-d data-iris stroke="var(--ink)" strokeWidth="1.5" />
            <circle cx="500" cy="500" r="92" pathLength="1" data-d data-iris stroke="var(--lime)" strokeWidth="2" />
            <path d={A.irisRay} pathLength="1" data-d data-irisray stroke="var(--lime)" strokeWidth="1" strokeOpacity=".7" />
            <circle cx="500" cy="500" r="24" data-n data-pupil fill="var(--lime)" />
            <circle cx="512" cy="489" r="6" data-n data-cap fill="var(--bg)" />
          </g>
          <circle cx="500" cy="500" r="5" data-n data-spark fill="var(--lime)" />
          <circle cx="500" cy="500" r="24" data-n data-pulse fill="none" stroke="var(--lime)" strokeWidth="1.5" />
          <g fontFamily="IBM Plex Mono, monospace" fontSize="13" letterSpacing="5" fill="var(--ink)" textAnchor="middle" data-n data-cap>
            <text x="500" y="800" opacity=".75">SS · COMPUTATIONAL PORTRAIT</text>
          </g>
        </g>
      </svg>
      <div ref={ring} className="pre__ring" />
      <div className="pre__hud mono" aria-hidden="true">
        <span>Subrata Saha</span>
        <span>stage / <b ref={stageEl}>awakening</b></span>
      </div>
      <button className="pre__skip mono" onClick={skip}>Skip intro <kbd>↵</kbd></button>
      <span className="sr-only">Loading portfolio. Press Enter to skip the intro animation.</span>
    </div>
  );
}
